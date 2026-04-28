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
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error("TOGETHER_API_KEY not configured");
    }

    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: data.prompt,
        width: 832,
        height: 1216,
        steps: 4,
        n: 1,
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`Together API error ${res.status}:`, txt.slice(0, 300));
      return { url: null as string | null, error: `together_${res.status}` };
    }

    const json = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    const first = json.data?.[0];
    if (first?.b64_json) {
      return { url: `data:image/png;base64,${first.b64_json}`, error: null };
    }
    if (first?.url) {
      return { url: first.url, error: null };
    }
    return { url: null, error: "no_image" };
  });
