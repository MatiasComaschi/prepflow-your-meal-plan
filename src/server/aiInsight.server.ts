export type InsightInput = {
  goal: string;
  goalText?: string;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  daily_calories?: number;
  recentTags?: string[];
};

const FALLBACK = "Tracking your taste — feed will keep adapting to what you save.";

export async function generateInsight(input: InsightInput): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return FALLBACK;

  const userMsg = JSON.stringify({
    goal: input.goal,
    goalText: input.goalText,
    targets: {
      kcal: input.daily_calories,
      protein_g: input.protein_g,
      carbs_g: input.carbs_g,
      fat_g: input.fat_g,
    },
    recent_tags: (input.recentTags ?? []).slice(0, 12),
  });

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly AI nutritionist. Given the user's goal, macro targets, and the recipe tags they're interacting with, write ONE short sentence (max 18 words) observing a behavior pattern and how the feed will adapt. No emojis. No preamble. No quotes.",
          },
          { role: "user", content: userMsg },
        ],
      }),
    });
    if (!res.ok) {
      console.error("aiInsight failed", res.status);
      return FALLBACK;
    }
    const json: any = await res.json();
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return FALLBACK;
    // Strip surrounding quotes if any
    return text.replace(/^["'`]|["'`]$/g, "").slice(0, 200);
  } catch (e) {
    console.error("aiInsight error", e);
    return FALLBACK;
  }
}
