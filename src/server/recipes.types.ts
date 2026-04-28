// Shared, client-safe types for recipe fetching.
export type RecipeFilters = {
  goal?: "lose_fat" | "build_muscle" | "recomp" | "maintain";
  restrictions?: string[];
  skill?: "beginner" | "intermediate" | "advanced";
  budget?: "under_50" | "50_100" | "100_150" | "no_limit";
  aiPlan?: {
    daily_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    meal_keywords: string[];
    avoid: string[];
  } | null;
  mealsPerDay?: number;
};
