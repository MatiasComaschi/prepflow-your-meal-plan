import { createServerFn } from "@tanstack/react-start";

export type AIPlan = {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_keywords: string[];
  avoid: string[];
  reasoning: string;
};

export const analyzeGoalServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { goalText: string }) => d)
  .handler(async ({ data }): Promise<{ plan: AIPlan | null; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { plan: null, error: "Missing LOVABLE_API_KEY" };

    const goalText = (data.goalText || "").trim().slice(0, 500);
    if (!goalText) return { plan: null, error: "Empty goal" };

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
            {
              role: "system",
              content:
                "You are an expert nutritionist. Analyze this person's goal and return JSON with: daily_calories, protein_g, carbs_g, fat_g, meal_keywords array, avoid array, and one sentence reasoning.",
            },
            { role: "user", content: goalText },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_nutrition_plan",
                description: "Return a personalized nutrition plan",
                parameters: {
                  type: "object",
                  properties: {
                    daily_calories: { type: "number" },
                    protein_g: { type: "number" },
                    carbs_g: { type: "number" },
                    fat_g: { type: "number" },
                    meal_keywords: { type: "array", items: { type: "string" } },
                    avoid: { type: "array", items: { type: "string" } },
                    reasoning: { type: "string" },
                  },
                  required: [
                    "daily_calories",
                    "protein_g",
                    "carbs_g",
                    "fat_g",
                    "meal_keywords",
                    "avoid",
                    "reasoning",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_nutrition_plan" } },
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Lovable AI error", res.status, t);
        return { plan: null, error: `AI error ${res.status}` };
      }

      const json: any = await res.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) return { plan: null, error: "No tool call returned" };
      const plan = typeof args === "string" ? JSON.parse(args) : args;
      return { plan: plan as AIPlan, error: null };
    } catch (e: any) {
      console.error("analyzeGoal failed", e);
      return { plan: null, error: e?.message ?? "Unknown error" };
    }
  });
