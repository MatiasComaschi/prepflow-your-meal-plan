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

export type ProfileForAI = {
  age?: number | null;
  biologicalSex?: string | null;
  heightUnit?: string;
  heightCm?: number | null;
  heightFt?: number | null;
  heightIn?: number | null;
  weightUnit?: string;
  currentWeight?: number | null;
  targetWeight?: number | null;
  activityLevel?: string | null;
  gymFrequency?: string | null;
  gymFocus?: string | null;
  goal?: string;
  goalText?: string;
  goalWhy?: string;
  timeline?: string | null;
  favoriteProteins?: string[];
  avoidFoods?: string[];
  avoidOther?: string;
  restrictions?: string[];
  spiceTolerance?: string | null;
  cookingFrequency?: string | null;
  skill?: string;
  budget?: string;
  mealsPerDay?: number;
  workoutTiming?: string | null;
  notes?: string;
};

function profileToText(p: ProfileForAI): string {
  const lines: string[] = [];
  const push = (label: string, v: unknown) => {
    if (v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return;
    lines.push(`- ${label}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
  };
  push("Age", p.age);
  push("Biological sex", p.biologicalSex);
  if (p.heightUnit === "ft_in" && (p.heightFt || p.heightIn)) {
    push("Height", `${p.heightFt ?? 0} ft ${p.heightIn ?? 0} in`);
  } else {
    push("Height", p.heightCm ? `${p.heightCm} cm` : null);
  }
  push("Current weight", p.currentWeight ? `${p.currentWeight} ${p.weightUnit ?? ""}` : null);
  push("Target weight", p.targetWeight ? `${p.targetWeight} ${p.weightUnit ?? ""}` : null);
  push("Daily activity outside gym", p.activityLevel);
  push("Gym frequency", p.gymFrequency);
  push("Gym focus", p.gymFocus);
  push("Workout timing", p.workoutTiming);
  push("Primary goal", p.goal);
  push("Goal in their words", p.goalText);
  push("Why this matters now", p.goalWhy);
  push("Timeline", p.timeline);
  push("Favorite proteins", p.favoriteProteins);
  push("Foods to avoid", p.avoidFoods);
  push("Other foods to avoid", p.avoidOther);
  push("Dietary restrictions", p.restrictions);
  push("Spice tolerance", p.spiceTolerance);
  push("Cooking frequency", p.cookingFrequency);
  push("Cooking skill", p.skill);
  push("Weekly grocery budget", p.budget);
  push("Meals per day", p.mealsPerDay);
  push("Anything else", p.notes);
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are an expert sports nutritionist and registered dietitian. You will be given a comprehensive client profile collected during onboarding. Use EVERY input in your reasoning — age, biological sex, height, current and target weight, daily activity, gym frequency and focus, workout timing, primary goal, the client's own words about what they're trying to achieve and why it matters to them now, timeline, favorite proteins, foods they dislike or avoid, dietary restrictions, spice tolerance, cooking frequency, skill, budget, meals per day, and any extra notes.

Estimate Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation when sex/height/weight are available, and adjust the activity multiplier using BOTH their daily activity level outside the gym AND their gym frequency/focus. Choose a calorie target appropriate for their goal and timeline (more aggressive for shorter timelines, but never below ~1200 kcal for women / ~1500 kcal for men). Set protein at 1.6–2.2 g/kg of bodyweight depending on training and goal, fat at 20–35% of calories, and the remainder as carbs.

For meal_keywords, prefer the client's favorite proteins and respect spice tolerance, cooking skill, budget, and cooking frequency (e.g. weekend meal prep → batch-friendly keywords). For avoid, include their disliked foods, "other" avoid text, and dietary restrictions translated into ingredient terms.

Reasoning must be ONE sentence that explicitly references the client's goal in their own words and the most important profile drivers (e.g. "Because you want to lean bulk over 3 months, train weights 4×/week, and prefer chicken/eggs, I set 2,650 kcal with 180g protein and skewed keywords toward batch-cook poultry.").`;

export const analyzeGoalServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { profile: ProfileForAI }) => d)
  .handler(async ({ data }): Promise<{ plan: AIPlan | null; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { plan: null, error: "Missing LOVABLE_API_KEY" };

    const profileText = profileToText(data.profile).slice(0, 4000);
    if (!profileText) return { plan: null, error: "Empty profile" };

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
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Here is my profile:\n\n${profileText}\n\nReturn my personalized nutrition plan.`,
            },
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

      if (res.status === 429) return { plan: null, error: "Rate limit — try again in a minute." };
      if (res.status === 402) return { plan: null, error: "AI usage credits exhausted." };
      if (!res.ok) {
        const t = await res.text();
        console.error("Lovable AI error", res.status, t);
        return { plan: null, error: `AI error ${res.status}` };
      }

      const json: unknown = await res.json();
      const args = (json as any).choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) return { plan: null, error: "No tool call returned" };
      const plan = typeof args === "string" ? JSON.parse(args) : args;
      return { plan: plan as AIPlan, error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error("analyzeGoal failed", e);
      return { plan: null, error: message };
    }
  });
