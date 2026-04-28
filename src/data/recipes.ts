import meal1 from "@/assets/meal-1.jpg";
import meal2 from "@/assets/meal-2.jpg";
import meal3 from "@/assets/meal-3.jpg";
import meal4 from "@/assets/meal-4.jpg";
import meal5 from "@/assets/meal-5.jpg";

export type Verification = "verified" | "ai" | "unverified";

export type Recipe = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  calories: number;
  protein: number; // grams
  carbs: number;
  fat: number;
  prepMinutes: number;
  verification: Verification;
  ingredients: { name: string; amount: string }[];
};

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Grilled Chicken & Quinoa",
    tagline: "High-protein classic",
    image: meal1,
    calories: 540,
    protein: 48,
    carbs: 52,
    fat: 14,
    prepMinutes: 25,
    verification: "verified",
    ingredients: [
      { name: "Chicken breast", amount: "180g" },
      { name: "Quinoa", amount: "80g dry" },
      { name: "Broccoli", amount: "150g" },
      { name: "Olive oil", amount: "1 tbsp" },
    ],
  },
  {
    id: "r2",
    name: "Salmon Poke Bowl",
    tagline: "Omega-3 powerhouse",
    image: meal2,
    calories: 620,
    protein: 38,
    carbs: 58,
    fat: 24,
    prepMinutes: 15,
    verification: "verified",
    ingredients: [
      { name: "Salmon fillet", amount: "150g" },
      { name: "Sushi rice", amount: "100g cooked" },
      { name: "Avocado", amount: "1/2" },
      { name: "Edamame", amount: "60g" },
      { name: "Sesame seeds", amount: "1 tsp" },
    ],
  },
  {
    id: "r3",
    name: "Beef Stir Fry",
    tagline: "Iron + complex carbs",
    image: meal3,
    calories: 580,
    protein: 42,
    carbs: 55,
    fat: 18,
    prepMinutes: 20,
    verification: "ai",
    ingredients: [
      { name: "Lean beef", amount: "150g" },
      { name: "Brown rice", amount: "90g cooked" },
      { name: "Bell peppers", amount: "1 large" },
      { name: "Scallions", amount: "2 stalks" },
      { name: "Soy sauce", amount: "2 tbsp" },
    ],
  },
  {
    id: "r4",
    name: "Overnight Oats Jar",
    tagline: "Set-and-forget breakfast",
    image: meal4,
    calories: 420,
    protein: 18,
    carbs: 56,
    fat: 14,
    prepMinutes: 5,
    verification: "verified",
    ingredients: [
      { name: "Rolled oats", amount: "60g" },
      { name: "Almond milk", amount: "200ml" },
      { name: "Blueberries", amount: "80g" },
      { name: "Almonds", amount: "15g" },
      { name: "Peanut butter", amount: "1 tbsp" },
    ],
  },
  {
    id: "r5",
    name: "Turkey Lettuce Wraps",
    tagline: "Low-carb, high flavor",
    image: meal5,
    calories: 360,
    protein: 34,
    carbs: 18,
    fat: 16,
    prepMinutes: 18,
    verification: "unverified",
    ingredients: [
      { name: "Ground turkey", amount: "150g" },
      { name: "Butter lettuce", amount: "1 head" },
      { name: "Carrots", amount: "1 medium" },
      { name: "Cilantro", amount: "1 handful" },
      { name: "Lime", amount: "1" },
    ],
  },
];
