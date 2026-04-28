import { createServerFn } from "@tanstack/react-start";
import type { Category } from "@/data/recipes";
import type { RecipeFilters } from "./recipes.types";
import { queryCache } from "./recipeCache.server";

export const queryCacheServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      category: Category;
      filters?: RecipeFilters;
      limit: number;
      excludeIds?: string[];
    }) => d,
  )
  .handler(async ({ data }) => queryCache(data));
