import { createServerFn } from "@tanstack/react-start";
import type { Category, Difficulty, Ingredient, Recipe } from "@/data/recipes";
import { reviewRecipeServerFn, applyReview } from "./aiReview";
import {
  queryCacheServerFn,
  saveCachedRecipe,
  incrementHits,
} from "./recipeCache";
import { getOrGenerateImage } from "./images";

const CACHE_THRESHOLD = 20;

const CATEGORY_TO_TYPE: Record<Category, string> = {
  Breakfast: "breakfast",
  Lunch: "main course",
  Dinner: "main course",
  Snack: "snack",
};

export type RecipeFilters = {
  // From preferences
  goal?: "lose_fat" | "build_muscle" | "recomp" | "maintain";
  restrictions?: string[]; // e.g. ["no_dairy", "vegan"]
  skill?: "beginner" | "intermediate" | "advanced";
  budget?: "under_50" | "50_100" | "100_150" | "no_limit";
  aiPlan?: {
    daily_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    meal_keywords: string[];
    avoid: string[];
  } | null;
  mealsPerDay?: number;
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

function buildPrefParams(
  filters: RecipeFilters | undefined,
  category: Category,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!filters) return out;

  // Goal -> macro/calorie targets (per recipe)
  // Snack ranges are halved
  const isSnack = category === "Snack";
  const halve = (n: number) => Math.round(n / 2);
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

  // Dietary restrictions
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

  // Skill level -> max ready time
  if (filters.skill === "beginner") out.maxReadyTime = "20";
  else if (filters.skill === "intermediate") out.maxReadyTime = "45";

  // Budget -> max ingredient count (proxy for complexity / cost)
  if (filters.budget === "under_50") out.maxIngredients = "6";
  else if (filters.budget === "50_100") out.maxIngredients = "10";
  else if (filters.budget === "100_150") out.maxIngredients = "14";

  // AI plan overrides — derive per-meal targets from daily totals
  if (filters.aiPlan) {
    const meals = Math.max(2, Math.min(6, filters.mealsPerDay ?? 3));
    const perMealCals = filters.aiPlan.daily_calories / meals;
    const perMealProtein = filters.aiPlan.protein_g / meals;
    const perMealCarbs = filters.aiPlan.carbs_g / meals;
    const perMealFat = filters.aiPlan.fat_g / meals;
    const isSnack = category === "Snack";
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

export const fetchRecipesServerFn = createServerFn({ method: "GET" })
  .inputValidator(
    (d: {
      category: Category;
      offset: number;
      number?: number;
      filters?: RecipeFilters;
    }) => d,
  )
  .handler(async ({ data }): Promise<{ recipes: Recipe[]; totalResults: number }> => {
    const number = Math.min(data.number ?? 10, 20);

    // ── 1. Cache-first: query Supabase for matching recipes ──
    let cached: Recipe[] = [];
    try {
      const cacheRes = await queryCacheServerFn({
        data: {
          category: data.category,
          filters: data.filters,
          limit: Math.max(number, CACHE_THRESHOLD),
        },
      });
      cached = cacheRes.recipes;
    } catch (e) {
      console.error("cache query failed", e);
    }

    // If cache has enough matches, serve entirely from cache — no API/AI calls.
    if (cached.length >= CACHE_THRESHOLD) {
      const slice = cached.slice(0, number);
      // Best-effort hit counting for popularity tracking
      incrementHits(slice.map((r) => r.id)).catch(() => {});
      return { recipes: slice, totalResults: cached.length };
    }

    // ── 2. Fall back to Spoonacular for the gap ──
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      // No key but maybe some cache — return what we have
      return { recipes: cached.slice(0, number), totalResults: cached.length };
    }

    const prefParams = buildPrefParams(data.filters, data.category);
    const params = new URLSearchParams({
      apiKey,
      type: CATEGORY_TO_TYPE[data.category],
      number: String(number),
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
      return { recipes: cached.slice(0, number), totalResults: cached.length };
    }
    const json: any = await res.json();
    const results: any[] = json.results ?? [];

    const cachedIds = new Set(cached.map((r) => r.id));
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
      .filter((r) => !cachedIds.has(r.id));

    // ── 3. AI quality-control review for new (uncached) recipes only ──
    const reviewed = await Promise.all(
      fresh.map(async (r) => {
        let confidence = 0;
        let updated = r;
        try {
          const review = await reviewRecipeServerFn({
            data: {
              recipe: {
                name: r.name,
                ingredients: r.ingredients.map((i) => ({
                  name: i.name,
                  amount: i.amount,
                })),
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

        // Generate (or fetch existing) the recipe image and persist to cache
        let imageUrl: string | null = null;
        try {
          imageUrl = await getOrGenerateImage(updated.id, updated.name);
        } catch (e) {
          console.error("Image gen failed for", updated.id, e);
        }
        if (imageUrl) updated = { ...updated, image: imageUrl };

        // Persist to Supabase cache (fire-and-forget)
        saveCachedRecipe(updated, confidence, imageUrl).catch(() => {});

        return updated;
      }),
    );

    // Combine cached + fresh, capped at requested number
    const combined = [...cached, ...reviewed].slice(0, number);
    incrementHits(cached.slice(0, number).map((r) => r.id)).catch(() => {});

    return {
      recipes: combined,
      totalResults: json.totalResults ?? combined.length,
    };
  });
