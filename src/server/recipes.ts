import { createServerFn } from "@tanstack/react-start";
import type { Category } from "@/data/recipes";
import type { RecipeFilters } from "./recipes.types";
import { fetchRecipes } from "./recipes.server";

export type { RecipeFilters } from "./recipes.types";

export const fetchRecipesServerFn = createServerFn({ method: "GET" })
  .inputValidator(
    (d: {
      category: Category;
      offset: number;
      number?: number;
      filters?: RecipeFilters;
      userId?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => fetchRecipes(data));
