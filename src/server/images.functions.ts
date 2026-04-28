import { createServerFn } from "@tanstack/react-start";
import { getOrGenerateImage } from "./images.server";

export const generateRecipeImageServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { recipeId: string; recipeName: string }) => {
    if (!data?.recipeId || !data?.recipeName)
      throw new Error("recipeId and recipeName required");
    if (data.recipeId.length > 200 || data.recipeName.length > 300)
      throw new Error("too long");
    return data;
  })
  .handler(async ({ data }) => {
    const url = await getOrGenerateImage(data.recipeId, data.recipeName);
    return { url, error: url ? null : "failed" };
  });
