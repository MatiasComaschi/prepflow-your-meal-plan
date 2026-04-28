// Server-only helpers. Do NOT import from client-reachable modules.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "recipe-images";

function publicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function buildPrompt(name: string): string {
  return `professional food photography of ${name}, overhead shot, dark moody background, restaurant quality plating, natural lighting, 4k`;
}

async function checkExisting(recipeId: string): Promise<string | null> {
  const fileName = `${recipeId}.png`;
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list("", { search: fileName, limit: 1 });
  if (error) {
    console.error("storage list error", error.message);
    return null;
  }
  if (data?.some((f) => f.name === fileName)) return publicUrl(fileName);
  return null;
}

async function callImageModel(prompt: string): Promise<string | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) {
    console.error(`Image model ${res.status}`, (await res.text()).slice(0, 300));
    return null;
  }
  const json: any = await res.json();
  return json.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
}

async function uploadDataUrl(recipeId: string, dataUrl: string): Promise<string | null> {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!m) {
    console.error("Unexpected image url format");
    return null;
  }
  const contentType = m[1];
  const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  const fileName = `${recipeId}.png`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, bytes, { contentType, upsert: true });
  if (error) {
    console.error("storage upload error", error.message);
    return null;
  }
  return publicUrl(fileName);
}

/**
 * Get-or-generate a permanent recipe image. Each recipe ID gets exactly one image
 * across all users, forever (until manually purged).
 */
export async function getOrGenerateImage(
  recipeId: string,
  recipeName: string,
): Promise<string | null> {
  const cached = await checkExisting(recipeId);
  if (cached) return cached;

  const generated = await callImageModel(buildPrompt(recipeName));
  if (!generated) return null;
  return await uploadDataUrl(recipeId, generated);
}

