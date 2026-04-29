// Server-only fetch + review + cache pipeline.
import { RECIPES, type Category, type Difficulty, type Ingredient, type Recipe } from "@/data/recipes";
import type { RecipeFilters } from "./recipes.types";
import { reviewRecipeServerFn, applyReview } from "./aiReview";
import {
  queryCache,
  saveCachedRecipe,
  incrementHits,
  countMatchingCached,
  markRecipesSeen,
} from "./recipeCache.server";
import { getOrGenerateImage } from "./images.server";

const CACHE_THRESHOLD = 20;
const MATCH_LOW = 50;
const MATCH_HIGH = 150;

const CATEGORY_TO_TYPE: Record<Category, string> = {
  Breakfast: "breakfast",
  Lunch: "main course",
  Dinner: "main course",
  Snack: "snack",
};

function pickNum(nutrients: any[], name: string): number {
  const n = nutrients?.find((x) => x.name?.toLowerCase() === name.toLowerCase());
  return n ? Math.round(Number(n.amount) || 0) : 0;
}

function difficultyFromTime(min: number): Difficulty {
  if (min <= 20) return "Easy";
  if (min <= 45) return "Medium";
  return "Hard";
}

function stripHtml(s: string): string {
  return (s || "").replace(/<[^>]+>/g, "").trim();
}

function localFallbackRecipes(data: FetchInput, number: number): Recipe[] {
  if (data.offset > 0) return [];

  const avoid = new Set(
    (data.filters?.aiPlan?.avoid ?? []).map((item) => item.toLowerCase().trim()).filter(Boolean),
  );
  const restrictions = new Set(data.filters?.restrictions ?? []);

  return RECIPES.filter((recipe) => recipe.category === data.category)
    .filter((recipe) => {
      const ingredients = recipe.ingredients.map((i) => i.name.toLowerCase()).join(" ");
      for (const item of avoid) {
        if (ingredients.includes(item)) return false;
      }
      if (restrictions.has("no_pork") && /\b(pork|bacon|ham|prosciutto)\b/.test(ingredients)) return false;
      if (restrictions.has("no_shellfish") && /\b(shrimp|prawn|crab|lobster|shellfish)\b/.test(ingredients)) return false;
      if (restrictions.has("no_dairy") && /\b(yogurt|cheese|feta|milk|whey|cottage)\b/.test(ingredients)) return false;
      if (restrictions.has("no_gluten") && /\b(bread|sourdough|pasta|wheat)\b/.test(ingredients)) return false;
      return true;
    })
    .sort((a, b) => {
      if (data.filters?.goal === "lose_fat") return b.protein - a.protein || a.calories - b.calories;
      if (data.filters?.goal === "build_muscle") return b.calories - a.calories || b.protein - a.protein;
      return b.protein - a.protein;
    })
    .slice(0, number);
}

function buildPrefParams(
  filters: RecipeFilters | undefined,
  category: Category,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!filters) return out;

  const isSnack = category === "Snack";
  if (filters.goal === "lose_fat") {
    out.minProtein = String(isSnack ? 10 : 25);
    out.maxCalories = String(isSnack ? 250 : 500);
  } else if (filters.goal === "build_muscle") {
    out.minProtein = String(isSnack ? 15 : 35);
    out.minCalories = String(isSnack ? 250 : 600);
  } else if (filters.goal === "recomp") {
    out.minProtein = String(isSnack ? 12 : 30);
    out.maxCalories = String(isSnack ? 300 : 650);
  } else if (filters.goal === "maintain") {
    out.minProtein = String(isSnack ? 8 : 20);
  }

  const r = new Set(filters.restrictions ?? []);
  const intolerances: string[] = [];
  let diet: string | undefined;
  if (r.has("no_dairy")) intolerances.push("dairy");
  if (r.has("no_gluten")) intolerances.push("gluten");
  if (r.has("no_shellfish")) intolerances.push("shellfish");
  if (r.has("vegan")) diet = "vegan";
  else if (r.has("vegetarian")) diet = "vegetarian";
  if (intolerances.length) out.intolerances = intolerances.join(",");
  if (diet) out.diet = diet;
  const excludes: string[] = [];
  if (r.has("no_pork")) excludes.push("pork", "bacon", "ham", "prosciutto");
  if (excludes.length) out.excludeIngredients = excludes.join(",");

  if (filters.skill === "beginner") out.maxReadyTime = "20";
  else if (filters.skill === "intermediate") out.maxReadyTime = "45";

  if (filters.budget === "under_50") out.maxIngredients = "6";
  else if (filters.budget === "50_100") out.maxIngredients = "10";
  else if (filters.budget === "100_150") out.maxIngredients = "14";

  if (filters.aiPlan) {
    const meals = Math.max(2, Math.min(6, filters.mealsPerDay ?? 3));
    const perMealCals = filters.aiPlan.daily_calories / meals;
    const perMealProtein = filters.aiPlan.protein_g / meals;
    const perMealCarbs = filters.aiPlan.carbs_g / meals;
    const perMealFat = filters.aiPlan.fat_g / meals;
    const scale = isSnack ? 0.5 : 1;

    out.minCalories = String(Math.max(50, Math.round(perMealCals * scale * 0.7)));
    out.maxCalories = String(Math.round(perMealCals * scale * 1.3));
    out.minProtein = String(Math.max(5, Math.round(perMealProtein * scale * 0.7)));
    out.maxProtein = String(Math.round(perMealProtein * scale * 1.5));
    out.minCarbs = String(Math.max(0, Math.round(perMealCarbs * scale * 0.4)));
    out.maxCarbs = String(Math.round(perMealCarbs * scale * 1.6));
    out.minFat = String(Math.max(0, Math.round(perMealFat * scale * 0.4)));
    out.maxFat = String(Math.round(perMealFat * scale * 1.6));

    if (filters.aiPlan.meal_keywords?.length) {
      out.query = filters.aiPlan.meal_keywords.slice(0, 4).join(" ");
    }
    if (filters.aiPlan.avoid?.length) {
      const avoid = filters.aiPlan.avoid.slice(0, 10).join(",");
      out.excludeIngredients = out.excludeIngredients
        ? `${out.excludeIngredients},${avoid}`
        : avoid;
    }
  }

  return out;
}

export type FetchInput = {
  category: Category;
  offset: number;
  number?: number;
  filters?: RecipeFilters;
  userId?: string | null;
};

export async function fetchRecipes(
  data: FetchInput,
): Promise<{ recipes: Recipe[]; totalResults: number }> {
  const number = Math.min(data.number ?? 10, 20);
  const userId = data.userId ?? null;

  // 1) Determine sliding-scale ratio from total matches in cache (ignores seen).
  let totalMatches = 0;
  try {
    totalMatches = await countMatchingCached(data.category, data.filters);
  } catch (e) {
    console.error("countMatchingCached failed", e);
  }

  let cacheRatio: number;
  if (totalMatches < MATCH_LOW) cacheRatio = 0;
  else if (totalMatches < MATCH_HIGH) cacheRatio = 0.4;
  else cacheRatio = 1;

  // 2) Query cache (excluding seen for this user).
  let cached: Recipe[] = [];
  try {
    const cacheRes = await queryCache({
      category: data.category,
      filters: data.filters,
      limit: Math.max(number, CACHE_THRESHOLD),
      userId,
    });
    cached = cacheRes.recipes;
  } catch (e) {
    console.error("cache query failed", e);
  }

  // 3) Fallback rule: if seen-exclusion drops cache below threshold, treat as new-user.
  if (cached.length < CACHE_THRESHOLD) {
    cacheRatio = 0;
  }

  const targetFromCache = Math.min(cached.length, Math.round(number * cacheRatio));
  const targetFromApi = number - targetFromCache;

  const cacheSlice = cached.slice(0, targetFromCache);

  // 4) If we're serving 100% from cache (or no API key), short-circuit.
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (targetFromApi <= 0 || !apiKey) {
    if (cacheSlice.length) {
      incrementHits(cacheSlice.map((r) => r.id)).catch(() => {});
      if (userId) markRecipesSeen(userId, cacheSlice.map((r) => r.id)).catch(() => {});
    }
    return { recipes: cacheSlice, totalResults: totalMatches || cacheSlice.length };
  }

  // 5) Fetch fresh from Spoonacular for the remainder.
  const prefParams = buildPrefParams(data.filters, data.category);
  const params = new URLSearchParams({
    apiKey,
    type: CATEGORY_TO_TYPE[data.category],
    number: String(Math.max(targetFromApi, number)),
    offset: String(Math.max(0, data.offset)),
    addRecipeNutrition: "true",
    addRecipeInformation: "true",
    instructionsRequired: "true",
    sort: "random",
    ...prefParams,
  });

  const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error("Spoonacular error", res.status, text);
    const fallback = cached.slice(0, number);
    if (fallback.length) {
      incrementHits(fallback.map((r) => r.id)).catch(() => {});
      if (userId) markRecipesSeen(userId, fallback.map((r) => r.id)).catch(() => {});
    }
    return { recipes: fallback, totalResults: totalMatches || fallback.length };
  }
  const json: any = await res.json();
  const results: any[] = json.results ?? [];

  if (results.length === 0) {
    const fallback = [...cached.slice(0, number), ...localFallbackRecipes(data, number)].slice(0, number);
    if (fallback.length) {
      incrementHits(fallback.map((r) => r.id)).catch(() => {});
      if (userId) markRecipesSeen(userId, fallback.map((r) => r.id)).catch(() => {});
    }
    return { recipes: fallback, totalResults: totalMatches || fallback.length };
  }

  const cacheIds = new Set(cacheSlice.map((r) => r.id));
  const fresh: Recipe[] = results
    .map((r) => {
      const nutrients = r.nutrition?.nutrients ?? [];
      const ings = r.nutrition?.ingredients ?? r.extendedIngredients ?? [];
      const ingredients: Ingredient[] = ings.map((i: any) => ({
        name: i.name ?? i.original ?? "ingredient",
        amount:
          i.amount && i.unit
            ? `${Math.round((Number(i.amount) || 0) * 100) / 100} ${i.unit}`.trim()
            : i.original ?? "",
      }));

      const steps: string[] = [];
      const blocks = r.analyzedInstructions ?? [];
      for (const b of blocks) {
        for (const s of b.steps ?? []) {
          if (s.step) steps.push(stripHtml(s.step));
        }
      }
      if (steps.length === 0 && r.instructions) {
        stripHtml(r.instructions)
          .split(/\.\s+|\n+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((s: string) => steps.push(s));
      }

      const prep = Math.max(5, Math.round(r.readyInMinutes ?? 25));
      const calories = pickNum(nutrients, "Calories");
      const protein = pickNum(nutrients, "Protein");
      const carbs = pickNum(nutrients, "Carbohydrates");
      const fat = pickNum(nutrients, "Fat");
      const fiber = pickNum(nutrients, "Fiber");

      return {
        id: `sp-${r.id}`,
        name: r.title ?? "Untitled",
        tagline: r.dishTypes?.[0]
          ? r.dishTypes[0].charAt(0).toUpperCase() + r.dishTypes[0].slice(1)
          : "Fresh from the kitchen",
        image: r.image ?? "",
        category: data.category,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        prepMinutes: prep,
        servings: r.servings ?? 1,
        difficulty: difficultyFromTime(prep),
        verification: r.veryHealthy ? "verified" : "ai",
        ingredients,
        steps: steps.length ? steps : ["Combine ingredients and serve."],
      } as Recipe;
    })
    .filter((r) => !cacheIds.has(r.id))
    .slice(0, targetFromApi);

  const reviewed = await Promise.all(
    fresh.map(async (r) => {
      let confidence = 0;
      let updated = r;
      try {
        const review = await reviewRecipeServerFn({
          data: {
            recipe: {
              name: r.name,
              ingredients: r.ingredients.map((i) => ({ name: i.name, amount: i.amount })),
              steps: r.steps,
              servings: r.servings,
              current: {
                prep_time_minutes: r.prepMinutes,
                calories: r.calories,
                protein_g: r.protein,
                carbs_g: r.carbs,
                fat_g: r.fat,
              },
            },
          },
        });
        updated = applyReview(r, review);
        confidence = review?.confidence ?? 0;
      } catch (e) {
        console.error("Review failed for", r.id, e);
        updated = applyReview(r, null);
      }

      let imageUrl: string | null = null;
      try {
        imageUrl = await getOrGenerateImage(updated.id, updated.name);
      } catch (e) {
        console.error("Image gen failed for", updated.id, e);
      }
      if (imageUrl) updated = { ...updated, image: imageUrl };

      saveCachedRecipe(updated, confidence, imageUrl).catch(() => {});
      return updated;
    }),
  );

  const combined = [...cacheSlice, ...reviewed].slice(0, number);

  if (combined.length === 0) {
    const fallback = localFallbackRecipes(data, number);
    return { recipes: fallback, totalResults: fallback.length };
  }

  if (cacheSlice.length) incrementHits(cacheSlice.map((r) => r.id)).catch(() => {});
  if (userId && combined.length) {
    markRecipesSeen(userId, combined.map((r) => r.id)).catch(() => {});
  }

  return {
    recipes: combined,
    totalResults: json.totalResults ?? combined.length,
  };
}
