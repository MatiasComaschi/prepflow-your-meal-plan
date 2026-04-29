import meal1 from "@/assets/meal-1.jpg";
import meal2 from "@/assets/meal-2.jpg";
import meal3 from "@/assets/meal-3.jpg";
import meal4 from "@/assets/meal-4.jpg";
import meal5 from "@/assets/meal-5.jpg";
import meal6 from "@/assets/meal-6.jpg";
import meal7 from "@/assets/meal-7.jpg";
import meal8 from "@/assets/meal-8.jpg";
import meal9 from "@/assets/meal-9.jpg";
import meal10 from "@/assets/meal-10.jpg";
import meal11 from "@/assets/meal-11.jpg";
import meal12 from "@/assets/meal-12.jpg";
import meal13 from "@/assets/meal-13.jpg";
import meal14 from "@/assets/meal-14.jpg";
import meal15 from "@/assets/meal-15.jpg";
import meal16 from "@/assets/meal-16.jpg";
import meal17 from "@/assets/meal-17.jpg";
import meal18 from "@/assets/meal-18.jpg";
import meal19 from "@/assets/meal-19.jpg";

export type Verification = "verified" | "ai" | "unverified";
export type Category = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Ingredient = {
  name: string;
  amount: string;
  brand?: string;
};

export type Recipe = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: Category;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepMinutes: number;
  servings: number;
  difficulty: Difficulty;
  verification: Verification;
  ingredients: Ingredient[];
  steps: string[];
  seen?: boolean;
};

export const CATEGORIES: Category[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export const RECIPES: Recipe[] = [
  // ───────────────────────── BREAKFAST ─────────────────────────
  {
    id: "b1",
    name: "Overnight Oats Jar",
    tagline: "Set-and-forget breakfast",
    image: meal4,
    category: "Breakfast",
    calories: 420, protein: 18, carbs: 56, fat: 14, fiber: 9,
    prepMinutes: 5, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Rolled oats", amount: "60g", brand: "Bob's Red Mill" },
      { name: "Unsweetened almond milk", amount: "200ml", brand: "Califia Farms" },
      { name: "Greek yogurt", amount: "80g", brand: "Fage 0%" },
      { name: "Blueberries", amount: "80g" },
      { name: "Almonds", amount: "15g", brand: "Blue Diamond" },
      { name: "Natural peanut butter", amount: "1 tbsp", brand: "Whole Earth" },
      { name: "Chia seeds", amount: "1 tsp" },
    ],
    steps: [
      "Combine oats, chia seeds, almond milk and yogurt in a 350ml jar.",
      "Stir well, seal and refrigerate overnight (min 4 hours).",
      "In the morning, top with blueberries, almonds and peanut butter.",
    ],
  },
  {
    id: "b2",
    name: "Avocado Egg Toast",
    tagline: "Healthy fats + protein",
    image: meal6,
    category: "Breakfast",
    calories: 380, protein: 19, carbs: 32, fat: 20, fiber: 8,
    prepMinutes: 10, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Sourdough bread", amount: "1 thick slice", brand: "Dave's Killer Bread" },
      { name: "Avocado", amount: "1/2 medium" },
      { name: "Egg", amount: "1 large", brand: "Vital Farms Pasture-Raised" },
      { name: "Cherry tomatoes", amount: "4" },
      { name: "Lemon juice", amount: "1 tsp" },
      { name: "Chili flakes", amount: "pinch" },
      { name: "Sea salt + pepper", amount: "to taste" },
    ],
    steps: [
      "Bring a small pot of water to a gentle simmer; add a splash of vinegar.",
      "Crack the egg into a ramekin, slide into the water and poach 3 minutes.",
      "Toast the sourdough until deeply golden.",
      "Mash the avocado with lemon juice, salt and pepper; spread onto toast.",
      "Top with the poached egg, halved tomatoes and chili flakes.",
    ],
  },
  {
    id: "b3",
    name: "Berry Yogurt Parfait",
    tagline: "Probiotic protein boost",
    image: meal7,
    category: "Breakfast",
    calories: 340, protein: 22, carbs: 42, fat: 8, fiber: 5,
    prepMinutes: 5, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Greek yogurt 2%", amount: "200g", brand: "Fage" },
      { name: "Low-sugar granola", amount: "40g", brand: "Purely Elizabeth" },
      { name: "Mixed berries", amount: "100g" },
      { name: "Raw honey", amount: "1 tsp", brand: "Manuka Doctor" },
    ],
    steps: [
      "Spoon half the yogurt into a glass.",
      "Layer half the granola and half the berries.",
      "Repeat layers, finish with a drizzle of honey.",
    ],
  },
  {
    id: "b4",
    name: "Protein Banana Pancakes",
    tagline: "Macro-friendly stack",
    image: meal8,
    category: "Breakfast",
    calories: 460, protein: 35, carbs: 48, fat: 12, fiber: 6,
    prepMinutes: 15, servings: 1, difficulty: "Medium", verification: "ai",
    ingredients: [
      { name: "Whey protein (vanilla)", amount: "1 scoop (30g)", brand: "Optimum Nutrition Gold" },
      { name: "Oat flour", amount: "40g", brand: "Bob's Red Mill" },
      { name: "Banana", amount: "1 ripe" },
      { name: "Egg whites", amount: "3", brand: "Eggland's Best" },
      { name: "Baking powder", amount: "1/2 tsp" },
      { name: "Blueberries", amount: "40g" },
      { name: "Pure maple syrup", amount: "1 tbsp", brand: "Crown Maple" },
    ],
    steps: [
      "Blend banana, egg whites, oat flour, protein and baking powder until smooth.",
      "Heat a non-stick pan over medium-low; lightly spray with oil.",
      "Pour 1/4 cup batter per pancake; cook 2 min, flip, cook 1 min.",
      "Stack and top with blueberries and a drizzle of maple syrup.",
    ],
  },
  {
    id: "b5",
    name: "Spinach Feta Scramble",
    tagline: "Iron + omega skillet",
    image: meal9,
    category: "Breakfast",
    calories: 320, protein: 24, carbs: 8, fat: 22, fiber: 3,
    prepMinutes: 12, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Whole eggs", amount: "3", brand: "Vital Farms" },
      { name: "Baby spinach", amount: "60g" },
      { name: "Cremini mushrooms", amount: "80g" },
      { name: "Feta cheese", amount: "30g", brand: "Président" },
      { name: "Extra virgin olive oil", amount: "1 tsp", brand: "California Olive Ranch" },
      { name: "Black pepper", amount: "to taste" },
    ],
    steps: [
      "Sauté mushrooms in olive oil over medium heat for 3–4 min.",
      "Add spinach and cook until just wilted.",
      "Whisk eggs with pepper, pour into pan and stir gently.",
      "When almost set, fold in crumbled feta and serve.",
    ],
  },
  {
    id: "b6",
    name: "Almond Butter Apple Toast",
    tagline: "Slow-burn morning fuel",
    image: meal16,
    category: "Breakfast",
    calories: 310, protein: 10, carbs: 38, fat: 14, fiber: 7,
    prepMinutes: 5, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Whole grain bread", amount: "2 slices", brand: "Ezekiel 4:9" },
      { name: "Almond butter", amount: "1.5 tbsp", brand: "Justin's Classic" },
      { name: "Honeycrisp apple", amount: "1/2, sliced thin" },
      { name: "Cinnamon", amount: "1/4 tsp" },
    ],
    steps: [
      "Toast the bread until crisp.",
      "Spread almond butter evenly on each slice.",
      "Fan apple slices on top and dust with cinnamon.",
    ],
  },
  {
    id: "b7",
    name: "Cottage Cheese Pineapple Bowl",
    tagline: "Casein + tropical carbs",
    image: meal19,
    category: "Breakfast",
    calories: 300, protein: 26, carbs: 28, fat: 9, fiber: 2,
    prepMinutes: 4, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Cottage cheese 2%", amount: "200g", brand: "Good Culture" },
      { name: "Fresh pineapple", amount: "120g" },
      { name: "Walnuts", amount: "15g" },
      { name: "Flaxseed", amount: "1 tsp", brand: "Bob's Red Mill" },
    ],
    steps: [
      "Spoon cottage cheese into a bowl.",
      "Top with pineapple chunks, walnuts and ground flaxseed.",
    ],
  },
  {
    id: "b8",
    name: "Greek Yogurt Power Jar",
    tagline: "Make-ahead breakfast",
    image: meal7,
    category: "Breakfast",
    calories: 390, protein: 28, carbs: 44, fat: 11, fiber: 6,
    prepMinutes: 6, servings: 1, difficulty: "Easy", verification: "ai",
    ingredients: [
      { name: "Greek yogurt 0%", amount: "250g", brand: "Chobani Plain" },
      { name: "Strawberries", amount: "80g" },
      { name: "Granola", amount: "30g", brand: "Bear Naked" },
      { name: "Pumpkin seeds", amount: "10g" },
      { name: "Honey", amount: "1 tsp" },
    ],
    steps: [
      "Layer yogurt, fruit, and granola in a sealable jar.",
      "Top with seeds and honey, refrigerate up to 24 hours.",
    ],
  },

  // ───────────────────────── LUNCH ─────────────────────────
  {
    id: "l1",
    name: "Grilled Chicken & Quinoa",
    tagline: "High-protein classic",
    image: meal1,
    category: "Lunch",
    calories: 540, protein: 48, carbs: 52, fat: 14, fiber: 7,
    prepMinutes: 25, servings: 1, difficulty: "Medium", verification: "verified",
    ingredients: [
      { name: "Chicken breast", amount: "180g", brand: "Bell & Evans Air-Chilled" },
      { name: "Quinoa", amount: "80g dry", brand: "Ancient Harvest" },
      { name: "Broccoli florets", amount: "150g" },
      { name: "Extra virgin olive oil", amount: "1 tbsp", brand: "California Olive Ranch" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Lemon", amount: "1/2" },
      { name: "Smoked paprika", amount: "1 tsp" },
    ],
    steps: [
      "Rinse quinoa and simmer in 160ml water for 15 min, covered.",
      "Season chicken with paprika, salt, pepper and minced garlic.",
      "Grill chicken 5–6 min per side until 75°C internal.",
      "Steam broccoli 4 min, toss with olive oil and lemon.",
      "Slice chicken and plate over quinoa with broccoli.",
    ],
  },
  {
    id: "l2",
    name: "Salmon Poke Bowl",
    tagline: "Omega-3 powerhouse",
    image: meal2,
    category: "Lunch",
    calories: 620, protein: 38, carbs: 58, fat: 24, fiber: 6,
    prepMinutes: 15, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Sushi-grade salmon", amount: "150g", brand: "Wild Alaskan Co." },
      { name: "Sushi rice (cooked)", amount: "150g" },
      { name: "Avocado", amount: "1/2" },
      { name: "Edamame", amount: "60g" },
      { name: "Cucumber", amount: "60g" },
      { name: "Low-sodium soy sauce", amount: "1 tbsp", brand: "Kikkoman Less Sodium" },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Sesame seeds", amount: "1 tsp" },
    ],
    steps: [
      "Cube salmon and toss with soy sauce and sesame oil.",
      "Layer rice in a bowl.",
      "Arrange salmon, avocado, edamame and cucumber on top.",
      "Sprinkle sesame seeds and serve immediately.",
    ],
  },
  {
    id: "l3",
    name: "Turkey Lettuce Wraps",
    tagline: "Low-carb, high flavor",
    image: meal5,
    category: "Lunch",
    calories: 360, protein: 34, carbs: 18, fat: 16, fiber: 4,
    prepMinutes: 18, servings: 1, difficulty: "Easy", verification: "ai",
    ingredients: [
      { name: "Lean ground turkey 93%", amount: "150g", brand: "Jennie-O" },
      { name: "Butter lettuce", amount: "1 head" },
      { name: "Carrot", amount: "1 medium, julienned" },
      { name: "Cilantro", amount: "1 small handful" },
      { name: "Lime", amount: "1" },
      { name: "Coconut aminos", amount: "1 tbsp", brand: "Bragg" },
      { name: "Ginger", amount: "1 tsp grated" },
    ],
    steps: [
      "Brown turkey with ginger over medium-high heat, 6–7 min.",
      "Stir in coconut aminos and squeeze of lime.",
      "Spoon into lettuce cups, top with carrot and cilantro.",
    ],
  },
  {
    id: "l4",
    name: "Mediterranean Chickpea Bowl",
    tagline: "Plant-based & filling",
    image: meal10,
    category: "Lunch",
    calories: 480, protein: 18, carbs: 56, fat: 20, fiber: 12,
    prepMinutes: 10, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Chickpeas (cooked)", amount: "200g", brand: "Eden Organic BPA-free" },
      { name: "Cucumber", amount: "100g, diced" },
      { name: "Cherry tomatoes", amount: "100g, halved" },
      { name: "Feta", amount: "30g", brand: "Président" },
      { name: "Kalamata olives", amount: "8" },
      { name: "Extra virgin olive oil", amount: "1 tbsp" },
      { name: "Red wine vinegar", amount: "1 tsp" },
      { name: "Fresh oregano", amount: "1 tsp" },
    ],
    steps: [
      "Drain and rinse chickpeas, place in a bowl.",
      "Add cucumber, tomatoes, olives and feta.",
      "Whisk olive oil, vinegar and oregano; toss to coat.",
    ],
  },
  {
    id: "l5",
    name: "Tuna Niçoise Plate",
    tagline: "Cafe-style protein plate",
    image: meal11,
    category: "Lunch",
    calories: 510, protein: 40, carbs: 32, fat: 22, fiber: 7,
    prepMinutes: 20, servings: 1, difficulty: "Medium", verification: "verified",
    ingredients: [
      { name: "Wild-caught tuna in olive oil", amount: "120g", brand: "Wild Planet" },
      { name: "Baby potatoes", amount: "150g" },
      { name: "Green beans", amount: "100g" },
      { name: "Hard-boiled eggs", amount: "2", brand: "Vital Farms" },
      { name: "Niçoise olives", amount: "10" },
      { name: "Dijon mustard", amount: "1 tsp", brand: "Maille" },
      { name: "Olive oil", amount: "1 tbsp" },
      { name: "Lemon juice", amount: "1 tbsp" },
    ],
    steps: [
      "Boil potatoes 12 min, add green beans for the last 4 min, then drain.",
      "Whisk dijon, olive oil and lemon juice for the dressing.",
      "Arrange potatoes, beans, halved eggs, tuna and olives on a plate.",
      "Drizzle with dressing and finish with cracked pepper.",
    ],
  },
  {
    id: "l6",
    name: "Beef Stir Fry",
    tagline: "Iron + complex carbs",
    image: meal3,
    category: "Lunch",
    calories: 580, protein: 42, carbs: 55, fat: 18, fiber: 6,
    prepMinutes: 20, servings: 1, difficulty: "Medium", verification: "ai",
    ingredients: [
      { name: "Lean flank steak", amount: "150g", brand: "ButcherBox Grass-Fed" },
      { name: "Brown rice (cooked)", amount: "180g", brand: "Lundberg Family Farms" },
      { name: "Bell peppers", amount: "1 large" },
      { name: "Scallions", amount: "2 stalks" },
      { name: "Low-sodium soy sauce", amount: "2 tbsp", brand: "Kikkoman" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Avocado oil", amount: "1 tbsp", brand: "Chosen Foods" },
    ],
    steps: [
      "Slice beef thin against the grain.",
      "Heat avocado oil in a wok over high heat; sear beef 90 sec.",
      "Add peppers, garlic and scallions; stir-fry 2 min.",
      "Splash in soy sauce, toss and serve over warm rice.",
    ],
  },
  {
    id: "l7",
    name: "Shrimp Street Tacos",
    tagline: "Lean + bright flavors",
    image: meal12,
    category: "Lunch",
    calories: 440, protein: 32, carbs: 42, fat: 14, fiber: 6,
    prepMinutes: 18, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Wild shrimp, peeled", amount: "150g", brand: "Wild American Shrimp" },
      { name: "Corn tortillas", amount: "3 small", brand: "Mi Rancho Organic" },
      { name: "Red cabbage, shredded", amount: "100g" },
      { name: "Lime", amount: "1" },
      { name: "Greek yogurt", amount: "2 tbsp" },
      { name: "Smoked paprika", amount: "1 tsp" },
      { name: "Cilantro", amount: "small handful" },
    ],
    steps: [
      "Toss shrimp with paprika, salt and a squeeze of lime.",
      "Sear shrimp in a hot pan 90 sec per side.",
      "Warm tortillas in a dry skillet.",
      "Mix yogurt with lime juice; spread on tortillas.",
      "Top with shrimp, cabbage and cilantro.",
    ],
  },
  {
    id: "l8",
    name: "Tofu Peanut Noodles",
    tagline: "Plant-protein powerhouse",
    image: meal15,
    category: "Lunch",
    calories: 560, protein: 28, carbs: 64, fat: 22, fiber: 8,
    prepMinutes: 22, servings: 1, difficulty: "Medium", verification: "ai",
    ingredients: [
      { name: "Extra-firm tofu", amount: "180g", brand: "Nasoya Organic" },
      { name: "Whole wheat soba noodles", amount: "80g dry", brand: "Eden Foods" },
      { name: "Natural peanut butter", amount: "1.5 tbsp", brand: "Crazy Richard's" },
      { name: "Low-sodium soy sauce", amount: "1 tbsp" },
      { name: "Lime juice", amount: "1 tbsp" },
      { name: "Maple syrup", amount: "1 tsp" },
      { name: "Cilantro + roasted peanuts", amount: "for topping" },
    ],
    steps: [
      "Press tofu 10 min, cube and pan-sear until golden on all sides.",
      "Cook soba per package, drain and rinse with cold water.",
      "Whisk peanut butter, soy sauce, lime, maple and 2 tbsp warm water.",
      "Toss noodles with sauce and tofu; top with cilantro and peanuts.",
    ],
  },

  // ───────────────────────── DINNER ─────────────────────────
  {
    id: "d1",
    name: "Baked Cod & Sweet Potato",
    tagline: "Lean white fish dinner",
    image: meal13,
    category: "Dinner",
    calories: 470, protein: 38, carbs: 44, fat: 12, fiber: 8,
    prepMinutes: 30, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Wild-caught cod fillet", amount: "180g", brand: "Wild Alaskan Co." },
      { name: "Sweet potato", amount: "1 medium (200g)" },
      { name: "Asparagus", amount: "150g" },
      { name: "Olive oil", amount: "1 tbsp" },
      { name: "Lemon", amount: "1/2" },
      { name: "Fresh thyme", amount: "1 tsp" },
      { name: "Garlic powder", amount: "1/2 tsp" },
    ],
    steps: [
      "Preheat oven to 200°C / 400°F.",
      "Cube sweet potato, toss with half the oil + thyme; roast 20 min.",
      "Add asparagus and cod (seasoned with garlic powder, lemon, oil) to the tray.",
      "Roast a further 10–12 min until cod flakes easily.",
    ],
  },
  {
    id: "d2",
    name: "Turkey Meatballs & Zoodles",
    tagline: "Italian, high-protein",
    image: meal14,
    category: "Dinner",
    calories: 460, protein: 42, carbs: 22, fat: 22, fiber: 6,
    prepMinutes: 30, servings: 1, difficulty: "Medium", verification: "verified",
    ingredients: [
      { name: "Ground turkey 93%", amount: "180g", brand: "Jennie-O" },
      { name: "Egg", amount: "1" },
      { name: "Almond flour", amount: "2 tbsp", brand: "Bob's Red Mill" },
      { name: "Zucchini, spiralized", amount: "2 medium" },
      { name: "Marinara sauce, no sugar added", amount: "150ml", brand: "Rao's Homemade" },
      { name: "Italian herbs", amount: "1 tsp" },
      { name: "Parmesan", amount: "10g" },
    ],
    steps: [
      "Combine turkey, egg, almond flour, herbs and salt; roll 8 meatballs.",
      "Brown meatballs in a hot pan, 2 min per side.",
      "Add marinara, simmer 12 min until cooked through.",
      "Quickly sauté zoodles 2 min, plate, top with meatballs and parmesan.",
    ],
  },
  {
    id: "d3",
    name: "Beef Pepper Stir Fry",
    tagline: "20-minute weeknight win",
    image: meal3,
    category: "Dinner",
    calories: 580, protein: 42, carbs: 55, fat: 18, fiber: 6,
    prepMinutes: 20, servings: 1, difficulty: "Medium", verification: "ai",
    ingredients: [
      { name: "Sirloin steak, sliced", amount: "150g", brand: "ButcherBox" },
      { name: "Brown rice (cooked)", amount: "180g" },
      { name: "Tri-color bell peppers", amount: "1 large total" },
      { name: "Onion", amount: "1/2" },
      { name: "Soy sauce", amount: "2 tbsp" },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Garlic + ginger", amount: "1 tsp each" },
    ],
    steps: [
      "Sear beef in a hot wok 90 sec until just browned; remove.",
      "Stir-fry onion + peppers 3 min.",
      "Return beef, add garlic, ginger, soy sauce and sesame oil; toss 1 min.",
      "Serve over brown rice.",
    ],
  },
  {
    id: "d4",
    name: "Salmon Poke Dinner Bowl",
    tagline: "Restaurant-quality at home",
    image: meal2,
    category: "Dinner",
    calories: 620, protein: 38, carbs: 58, fat: 24, fiber: 6,
    prepMinutes: 15, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Sushi-grade salmon", amount: "170g", brand: "Wild Alaskan Co." },
      { name: "Sushi rice", amount: "180g cooked" },
      { name: "Avocado", amount: "1/2" },
      { name: "Edamame", amount: "80g" },
      { name: "Pickled ginger", amount: "1 tbsp" },
      { name: "Soy sauce", amount: "1 tbsp" },
      { name: "Sriracha + Kewpie mayo", amount: "1 tsp each" },
    ],
    steps: [
      "Cube salmon, toss with soy sauce.",
      "Mix sriracha and mayo for spicy drizzle.",
      "Layer rice, salmon, avocado, edamame, ginger.",
      "Drizzle spicy mayo over the bowl.",
    ],
  },
  {
    id: "d5",
    name: "Mediterranean Chickpea Skillet",
    tagline: "Vegetarian dinner staple",
    image: meal10,
    category: "Dinner",
    calories: 520, protein: 20, carbs: 62, fat: 22, fiber: 14,
    prepMinutes: 18, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Chickpeas", amount: "240g cooked", brand: "Eden Organic" },
      { name: "Diced tomatoes", amount: "200g", brand: "Mutti" },
      { name: "Spinach", amount: "100g" },
      { name: "Feta", amount: "40g" },
      { name: "Olive oil", amount: "1 tbsp" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Smoked paprika", amount: "1 tsp" },
    ],
    steps: [
      "Sauté garlic in olive oil 30 sec.",
      "Add chickpeas and paprika, toast 2 min.",
      "Pour in tomatoes, simmer 8 min until thickened.",
      "Stir in spinach until wilted; top with crumbled feta.",
    ],
  },
  {
    id: "d6",
    name: "Chicken & Quinoa Power Plate",
    tagline: "Macro-perfect dinner",
    image: meal1,
    category: "Dinner",
    calories: 560, protein: 50, carbs: 54, fat: 14, fiber: 8,
    prepMinutes: 25, servings: 1, difficulty: "Medium", verification: "verified",
    ingredients: [
      { name: "Chicken breast", amount: "200g", brand: "Bell & Evans" },
      { name: "Quinoa", amount: "80g dry" },
      { name: "Roasted broccoli", amount: "180g" },
      { name: "Olive oil", amount: "1 tbsp" },
      { name: "Lemon", amount: "1/2" },
      { name: "Garlic powder + smoked paprika", amount: "1 tsp each" },
    ],
    steps: [
      "Cook quinoa per package.",
      "Roast broccoli at 220°C / 425°F for 18 min with olive oil and salt.",
      "Pan-sear chicken 5 min per side, rest 5 min, slice.",
      "Plate over quinoa, finish with lemon.",
    ],
  },
  {
    id: "d7",
    name: "Tofu Pad Thai",
    tagline: "Plant-based takeout night",
    image: meal15,
    category: "Dinner",
    calories: 590, protein: 28, carbs: 68, fat: 22, fiber: 8,
    prepMinutes: 25, servings: 1, difficulty: "Medium", verification: "ai",
    ingredients: [
      { name: "Extra firm tofu", amount: "200g", brand: "Nasoya" },
      { name: "Brown rice noodles", amount: "80g dry", brand: "Lotus Foods" },
      { name: "Tamari", amount: "2 tbsp", brand: "San-J" },
      { name: "Tamarind paste", amount: "1 tbsp" },
      { name: "Maple syrup", amount: "1 tsp" },
      { name: "Lime, peanuts, cilantro", amount: "to finish" },
      { name: "Bean sprouts", amount: "60g" },
    ],
    steps: [
      "Soak rice noodles in hot water 8 min, drain.",
      "Cube and pan-sear tofu until golden.",
      "Whisk tamari, tamarind and maple as the sauce.",
      "Toss noodles, tofu, sprouts and sauce in a hot pan 2 min.",
      "Top with peanuts, cilantro and lime.",
    ],
  },
  {
    id: "d8",
    name: "Shrimp Tacos Dinner Plate",
    tagline: "Friday night macros",
    image: meal12,
    category: "Dinner",
    calories: 480, protein: 34, carbs: 46, fat: 16, fiber: 6,
    prepMinutes: 20, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Wild shrimp", amount: "180g", brand: "Wild American Shrimp" },
      { name: "Corn tortillas", amount: "3", brand: "Mi Rancho" },
      { name: "Cabbage slaw", amount: "120g" },
      { name: "Avocado", amount: "1/2" },
      { name: "Greek yogurt + lime crema", amount: "3 tbsp" },
      { name: "Chipotle seasoning", amount: "1 tsp" },
    ],
    steps: [
      "Toss shrimp with chipotle and lime, sear 90 sec per side.",
      "Warm tortillas; spread crema.",
      "Build tacos with shrimp, slaw and avocado.",
    ],
  },

  // ───────────────────────── SNACK ─────────────────────────
  {
    id: "s1",
    name: "Apple + Almond Butter",
    tagline: "Crunch + slow energy",
    image: meal16,
    category: "Snack",
    calories: 220, protein: 5, carbs: 26, fat: 12, fiber: 6,
    prepMinutes: 3, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Honeycrisp apple", amount: "1 medium" },
      { name: "Almond butter", amount: "1.5 tbsp", brand: "Justin's Classic" },
      { name: "Cinnamon", amount: "pinch" },
    ],
    steps: [
      "Core and slice the apple into wedges.",
      "Serve with almond butter for dipping; dust with cinnamon.",
    ],
  },
  {
    id: "s2",
    name: "Hummus & Crudité",
    tagline: "Fiber + healthy fats",
    image: meal17,
    category: "Snack",
    calories: 240, protein: 8, carbs: 24, fat: 12, fiber: 7,
    prepMinutes: 5, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Hummus", amount: "60g", brand: "Cedar's Original" },
      { name: "Carrot sticks", amount: "100g" },
      { name: "Cucumber sticks", amount: "100g" },
      { name: "Bell pepper strips", amount: "60g" },
    ],
    steps: [
      "Cut vegetables into sticks.",
      "Serve with hummus on the side.",
    ],
  },
  {
    id: "s3",
    name: "Chocolate Protein Energy Balls",
    tagline: "No-bake protein bites",
    image: meal18,
    category: "Snack",
    calories: 180, protein: 9, carbs: 18, fat: 8, fiber: 3,
    prepMinutes: 12, servings: 2, difficulty: "Easy", verification: "ai",
    ingredients: [
      { name: "Rolled oats", amount: "60g", brand: "Bob's Red Mill" },
      { name: "Chocolate whey protein", amount: "1 scoop", brand: "Optimum Nutrition Gold" },
      { name: "Natural peanut butter", amount: "2 tbsp", brand: "Crazy Richard's" },
      { name: "Raw cocoa powder", amount: "1 tbsp", brand: "Navitas" },
      { name: "Honey", amount: "1 tbsp" },
      { name: "Almond milk", amount: "as needed" },
    ],
    steps: [
      "Mix all dry ingredients in a bowl.",
      "Stir in peanut butter and honey, add splashes of almond milk to bind.",
      "Roll into 8 balls and chill 30 min before serving.",
    ],
  },
  {
    id: "s4",
    name: "Cottage Cheese & Pineapple",
    tagline: "Casein-rich snack",
    image: meal19,
    category: "Snack",
    calories: 200, protein: 22, carbs: 18, fat: 4, fiber: 1,
    prepMinutes: 3, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Cottage cheese 2%", amount: "180g", brand: "Good Culture" },
      { name: "Fresh pineapple", amount: "100g" },
    ],
    steps: [
      "Spoon cottage cheese into a bowl.",
      "Top with pineapple chunks.",
    ],
  },
  {
    id: "s5",
    name: "Greek Yogurt Berry Cup",
    tagline: "Probiotic protein hit",
    image: meal7,
    category: "Snack",
    calories: 170, protein: 17, carbs: 18, fat: 2, fiber: 3,
    prepMinutes: 3, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Greek yogurt 0%", amount: "170g", brand: "Fage" },
      { name: "Mixed berries", amount: "80g" },
      { name: "Honey", amount: "1 tsp" },
    ],
    steps: [
      "Spoon yogurt into a cup.",
      "Top with berries and a drizzle of honey.",
    ],
  },
  {
    id: "s6",
    name: "Avocado Rice Cake",
    tagline: "Crunchy, satisfying",
    image: meal6,
    category: "Snack",
    calories: 210, protein: 6, carbs: 22, fat: 12, fiber: 5,
    prepMinutes: 4, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Brown rice cakes", amount: "2", brand: "Lundberg Lightly Salted" },
      { name: "Avocado", amount: "1/2" },
      { name: "Cherry tomatoes", amount: "4, halved" },
      { name: "Hemp hearts", amount: "1 tsp", brand: "Manitoba Harvest" },
      { name: "Chili flakes", amount: "pinch" },
    ],
    steps: [
      "Mash avocado, spread onto rice cakes.",
      "Top with tomatoes, hemp hearts and chili flakes.",
    ],
  },
  {
    id: "s7",
    name: "Almond Trail Mix",
    tagline: "Pre-workout fuel",
    image: meal16,
    category: "Snack",
    calories: 240, protein: 7, carbs: 20, fat: 16, fiber: 4,
    prepMinutes: 2, servings: 1, difficulty: "Easy", verification: "ai",
    ingredients: [
      { name: "Raw almonds", amount: "20g", brand: "Blue Diamond" },
      { name: "Walnuts", amount: "10g" },
      { name: "Dark chocolate chips 70%", amount: "10g", brand: "Hu Kitchen" },
      { name: "Dried cranberries (no added sugar)", amount: "15g", brand: "Eden" },
    ],
    steps: [
      "Combine all ingredients in a small container.",
      "Portion into a snack bag and grab on the go.",
    ],
  },
  {
    id: "s8",
    name: "Turkey Roll-Ups",
    tagline: "Pure protein snack",
    image: meal5,
    category: "Snack",
    calories: 190, protein: 24, carbs: 6, fat: 8, fiber: 2,
    prepMinutes: 4, servings: 1, difficulty: "Easy", verification: "verified",
    ingredients: [
      { name: "Roasted turkey breast slices", amount: "100g", brand: "Applegate Naturals" },
      { name: "Hummus", amount: "2 tbsp", brand: "Cedar's" },
      { name: "Cucumber sticks", amount: "60g" },
      { name: "Spinach leaves", amount: "small handful" },
    ],
    steps: [
      "Lay turkey slices flat, smear with hummus.",
      "Place cucumber and spinach at one edge; roll up tightly.",
    ],
  },
];
