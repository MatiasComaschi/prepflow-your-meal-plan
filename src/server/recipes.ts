import { createServerFn } from "@tanstack/react-start";

export type Verification = "verified" | "ai" | "unverified";
export type Category = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Ingredient = {
  name: string;
  amount: string;
  brand?: string;
};

export type Recipe = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: Category;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepMinutes: number;
  servings: number;
  difficulty: Difficulty;
  verification: Verification;
  ingredients: Ingredient[];
  steps: string[];
};

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

export const fetchRecipesServerFn = createServerFn({ method: "GET" })
  .inputValidator((d: { category: Category; offset: number; number?: number }) => d)
  .handler(async ({ data }): Promise<{ recipes: Recipe[]; totalResults: number }> => {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return { recipes: [], totalResults: 0 };
    }

    const number = Math.min(data.number ?? 10, 20);
    const params = new URLSearchParams({
      apiKey,
      type: CATEGORY_TO_TYPE[data.category],
      number: String(number),
      offset: String(Math.max(0, data.offset)),
      addRecipeNutrition: "true",
      addRecipeInformation: "true",
      instructionsRequired: "true",
      sort: "random",
    });

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error("Spoonacular error", res.status, text);
      return { recipes: [], totalResults: 0 };
    }
    const json: any = await res.json();
    const results: any[] = json.results ?? [];

    const recipes: Recipe[] = results.map((r) => {
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
      };
    });

    return { recipes, totalResults: json.totalResults ?? recipes.length };
  });
