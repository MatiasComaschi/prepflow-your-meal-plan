import { createServerFn } from "@tanstack/react-start";

type GenerateInput = { prompt: string };

export const generateRecipeImageServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: GenerateInput) => {
    if (!data || typeof data.prompt !== "string" || data.prompt.length === 0) {
      throw new Error("prompt is required");
    }
    if (data.prompt.length > 1000) {
      throw new Error("prompt too long");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return { url: null as string | null, error: "no_api_key" };
    }

    try {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: data.prompt }],
            modalities: ["image", "text"],
          }),
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(`Lovable AI image error ${res.status}:`, txt.slice(0, 300));
        return { url: null, error: `lovable_${res.status}` };
      }

      const json = (await res.json()) as {
        choices?: Array<{
          message?: {
            images?: Array<{ image_url?: { url?: string } }>;
          };
        }>;
      };
      const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!url) {
        return { url: null, error: "no_image" };
      }
      return { url, error: null };
    } catch (e) {
      console.error("Image generation failed:", e);
      return { url: null, error: "exception" };
    }
  });
