// Server-only helpers. Do NOT import from client-reachable modules.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Category, Recipe } from "@/data/recipes";
import type { RecipeFilters } from "./recipes.types";

export type QueryCacheInput = {
  category: Category;
  filters?: RecipeFilters;
  limit: number;
  excludeIds?: string[];
};

// ───────────────────────── Tag derivation ─────────────────────────
export function deriveTags(r: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepMinutes: number;
}): string[] {
  const tags = new Set<string>();
  // Macro profile
  if (r.protein >= 30) tags.add("high-protein");
  if (r.protein >= 40) tags.add("very-high-protein");
  if (r.carbs <= 20) tags.add("low-carb");
  if (r.carbs >= 50) tags.add("high-carb");
  if (r.fat <= 12) tags.add("low-fat");
  if (r.fat >= 25) tags.add("high-fat");
  if (r.fiber >= 8) tags.add("high-fiber");
  // Calorie buckets
  if (r.calories <= 350) tags.add("low-calorie");
  else if (r.calories <= 550) tags.add("moderate-calorie");
  else tags.add("high-calorie");
  // Goal-oriented
  if (r.calories <= 500 && r.protein >= 25) tags.add("cutting");
  if (r.calories >= 600 && r.protein >= 30) tags.add("bulking");
  if (r.calories >= 400 && r.calories <= 600 && r.protein >= 25) tags.add("recomp");
  // Time
  if (r.prepMinutes <= 15) tags.add("quick");
  if (r.prepMinutes <= 30) tags.add("under-30");
  return Array.from(tags);
}

// ───────────────────────── Tags from filters ─────────────────────────
export function tagsFromFilters(filters: RecipeFilters | undefined): string[] {
  if (!filters) return [];
  const tags = new Set<string>();
  if (filters.goal === "lose_fat") tags.add("cutting");
  if (filters.goal === "build_muscle") tags.add("bulking");
  if (filters.goal === "recomp") tags.add("recomp");
  if (filters.skill === "beginner") tags.add("quick");

  const plan = filters.aiPlan;
  if (plan) {
    const meals = Math.max(2, Math.min(6, filters.mealsPerDay ?? 3));
    const perCals = plan.daily_calories / meals;
    const perProtein = plan.protein_g / meals;
    const perCarbs = plan.carbs_g / meals;
    const perFat = plan.fat_g / meals;
    if (perProtein >= 30) tags.add("high-protein");
    if (perCarbs <= 20) tags.add("low-carb");
    if (perFat <= 12) tags.add("low-fat");
    if (perCals <= 400) tags.add("low-calorie");
    if (perCals >= 600) tags.add("high-calorie");
  }
  return Array.from(tags);
}

// ───────────────────────── Row → Recipe ─────────────────────────
function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? "",
    image: row.image_url ?? "",
    category: row.category as Category,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    prepMinutes: row.prep_minutes,
    servings: row.servings,
    difficulty: row.difficulty as Recipe["difficulty"],
    verification: row.confidence >= 70 ? "verified" : "ai",
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    steps: Array.isArray(row.steps) ? row.steps : [],
  };
}

// ───────────────────────── Save ─────────────────────────
export async function saveCachedRecipe(
  recipe: Recipe,
  confidence: number,
  imageUrl: string | null,
): Promise<void> {
  const tags = deriveTags(recipe);
  const { error } = await supabaseAdmin.from("cached_recipes").upsert(
    {
      id: recipe.id,
      name: recipe.name,
      tagline: recipe.tagline,
      category: recipe.category,
      source: recipe.id.startsWith("sp-") ? "spoonacular" : "seed",
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      prep_minutes: recipe.prepMinutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      confidence,
      tags,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      image_url: imageUrl,
    },
    { onConflict: "id" },
  );
  if (error) console.error("saveCachedRecipe error", error.message);
}

// ───────────────────────── Query cache ─────────────────────────
export async function queryCache(
  data: QueryCacheInput,
): Promise<{ recipes: Recipe[] }> {
  const wantedTags = tagsFromFilters(data.filters);
  let q = supabaseAdmin
    .from("cached_recipes")
    .select("*")
    .eq("category", data.category);

  if (wantedTags.length) {
    q = q.overlaps("tags", wantedTags);
  }
  if (data.excludeIds?.length) {
    q = q.not("id", "in", `(${data.excludeIds.map((s) => `"${s}"`).join(",")})`);
  }

  const plan = data.filters?.aiPlan;
  if (plan) {
    const meals = Math.max(2, Math.min(6, data.filters?.mealsPerDay ?? 3));
    const isSnack = data.category === "Snack";
    const scale = isSnack ? 0.5 : 1;
    const minC = Math.max(50, Math.round((plan.daily_calories / meals) * scale * 0.6));
    const maxC = Math.round((plan.daily_calories / meals) * scale * 1.4);
    q = q.gte("calories", minC).lte("calories", maxC);
  }

  const { data: rows, error } = await q
    .order("hits", { ascending: false })
    .limit(Math.min(50, Math.max(1, data.limit)));

  if (error) {
    console.error("queryCache error", error.message);
    return { recipes: [] };
  }
  return { recipes: (rows ?? []).map(rowToRecipe) };
}

// ───────────────────────── Increment hits ─────────────────────────
export async function incrementHits(ids: string[]): Promise<void> {
  if (!ids.length) return;
  // Best-effort: read current hits, then upsert. RPC would be cleaner but avoids new migration.
  const { data: rows } = await supabaseAdmin
    .from("cached_recipes")
    .select("id, hits")
    .in("id", ids);
  if (!rows) return;
  await Promise.all(
    rows.map((r) =>
      supabaseAdmin
        .from("cached_recipes")
        .update({ hits: (r.hits ?? 0) + 1 })
        .eq("id", r.id),
    ),
  );
}
