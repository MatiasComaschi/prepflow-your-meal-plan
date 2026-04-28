import { createServerFn } from "@tanstack/react-start";
import type { Recipe } from "@/data/recipes";

type ReviewInput = {
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  servings: number;
  current: {
    prep_time_minutes: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
};

export type ReviewResult = {
  prep_time_minutes: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
};

export const reviewRecipeServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { recipe: ReviewInput }) => d)
  .handler(async ({ data }): Promise<ReviewResult | null> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return null;

    const systemPrompt =
      "You are an expert nutritionist and chef. Review this recipe data and correct any inaccuracies as well as cooking steps. Verify and correct: 1) Prep time — calculate realistic prep + cook time based on the actual steps and ingredients, not the API estimate. 2) Calories — recalculate total kcal from the actual ingredients and quantities using nutritional data. 3) Macros — recalculate protein, carbs, fat from scratch based on ingredients. Return values are PER SERVING. Provide a confidence score 0-100 reflecting how reliable your estimate is given the ingredient specificity.";

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(data.recipe) },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "submit_review",
                description: "Submit corrected recipe nutrition and timing.",
                parameters: {
                  type: "object",
                  properties: {
                    prep_time_minutes: { type: "number" },
                    calories: { type: "number" },
                    protein_g: { type: "number" },
                    carbs_g: { type: "number" },
                    fat_g: { type: "number" },
                    confidence: { type: "number", minimum: 0, maximum: 100 },
                  },
                  required: [
                    "prep_time_minutes",
                    "calories",
                    "protein_g",
                    "carbs_g",
                    "fat_g",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "submit_review" } },
        }),
      });

      if (!res.ok) {
        console.error("AI review error", res.status, await res.text());
        return null;
      }
      const json: any = await res.json();
      const args =
        json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) return null;
      const parsed = JSON.parse(args);
      return {
        prep_time_minutes: Math.max(1, Math.round(parsed.prep_time_minutes)),
        calories: Math.max(0, Math.round(parsed.calories)),
        protein_g: Math.max(0, Math.round(parsed.protein_g)),
        carbs_g: Math.max(0, Math.round(parsed.carbs_g)),
        fat_g: Math.max(0, Math.round(parsed.fat_g)),
        confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence))),
      };
    } catch (e) {
      console.error("AI review threw", e);
      return null;
    }
  });

// Helper to apply review to a recipe (used internally)
export function applyReview(recipe: Recipe, review: ReviewResult | null): Recipe {
  if (!review) {
    return { ...recipe, verification: "ai" };
  }
  return {
    ...recipe,
    prepMinutes: review.prep_time_minutes,
    calories: review.calories,
    protein: review.protein_g,
    carbs: review.carbs_g,
    fat: review.fat_g,
    verification: review.confidence >= 70 ? "verified" : "ai",
  };
}
