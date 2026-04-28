import type { Recipe } from "@/data/recipes";
import type { AIPlan } from "@/store/preferences";

export type MacroGap = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  largest: "protein" | "carbs" | "fat";
};

export type SwapInfo = {
  from: string;
  to: string;
  reason: string;
};

export type FeedItem =
  | { card_type: "recipe"; key: string; recipe: Recipe; eager?: boolean }
  | { card_type: "macro_check"; key: string; gap: MacroGap }
  | { card_type: "ai_insight"; key: string; insight: string }
  | { card_type: "streak_card"; key: string; streak: number; daysPlanned: number }
  | { card_type: "swap_suggestion"; key: string; swap: SwapInfo }
  | {
      card_type: "progress_recap";
      key: string;
      planned: number;
      goalDays: number;
      topMacro: "protein" | "carbs" | "fat";
      coverage: number;
    };

const INSIGHT_ORDER: Array<FeedItem["card_type"]> = [
  "macro_check",
  "ai_insight",
  "streak_card",
  "swap_suggestion",
  "progress_recap",
];

// Tiny deterministic hash for stable cadence
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type BuildFeedCtx = {
  aiPlan: AIPlan | null | undefined;
  weeklyTotals: { protein: number; carbs: number; fat: number; calories: number };
  daysPlanned: number;
  goalDays: number;
  streak: number;
  insight: string | null;
};

function computeGap(ctx: BuildFeedCtx): MacroGap | null {
  if (!ctx.aiPlan) return null;
  const targetP = ctx.aiPlan.protein_g * 7;
  const targetC = ctx.aiPlan.carbs_g * 7;
  const targetF = ctx.aiPlan.fat_g * 7;
  const targetCal = ctx.aiPlan.daily_calories * 7;
  const gP = Math.max(0, targetP - ctx.weeklyTotals.protein);
  const gC = Math.max(0, targetC - ctx.weeklyTotals.carbs);
  const gF = Math.max(0, targetF - ctx.weeklyTotals.fat);
  const gCal = Math.max(0, targetCal - ctx.weeklyTotals.calories);
  const ratios = {
    protein: gP / Math.max(1, targetP),
    carbs: gC / Math.max(1, targetC),
    fat: gF / Math.max(1, targetF),
  };
  const largest = (Object.keys(ratios) as Array<"protein" | "carbs" | "fat">).reduce(
    (a, b) => (ratios[a] >= ratios[b] ? a : b),
  );
  return { protein: gP, carbs: gC, fat: gF, calories: gCal, largest };
}

function computeSwap(recipes: Recipe[], ctx: BuildFeedCtx): SwapInfo | null {
  if (!ctx.aiPlan || recipes.length === 0) return null;
  // Find a recent recipe whose macros poorly fit goal
  const target = ctx.aiPlan;
  let worst: { r: Recipe; score: number } | null = null;
  for (const r of recipes.slice(-12)) {
    // distance from per-meal target (assume 3 meals/day)
    const perMealCal = target.daily_calories / 3;
    const perMealP = target.protein_g / 3;
    const score =
      Math.abs(r.calories - perMealCal) / perMealCal +
      Math.max(0, perMealP - r.protein) / Math.max(1, perMealP);
    if (!worst || score > worst.score) worst = { r, score };
  }
  if (!worst) return null;
  const keyword = target.meal_keywords?.[0] ?? "high-protein";
  return {
    from: worst.r.name,
    to: `${keyword} alternative`,
    reason:
      worst.r.protein < target.protein_g / 3
        ? "lower protein than your goal needs"
        : "calories drift from your daily target",
  };
}

export function buildFeed(recipes: Recipe[], ctx: BuildFeedCtx): FeedItem[] {
  const out: FeedItem[] = [];
  let insightCursor = 0;
  let nextAt = 6 + (hash("seed") % 3); // first insight at 6-8

  const gap = computeGap(ctx);
  const swap = computeSwap(recipes, ctx);

  recipes.forEach((r, i) => {
    out.push({ card_type: "recipe", key: `r-${r.id}`, recipe: r, eager: i === 0 });
    if (i + 1 === nextAt) {
      // pick next available insight type, rotating
      for (let attempt = 0; attempt < INSIGHT_ORDER.length; attempt++) {
        const type = INSIGHT_ORDER[(insightCursor + attempt) % INSIGHT_ORDER.length];
        const item = makeInsight(type, i, { gap, swap, ctx });
        if (item) {
          out.push(item);
          insightCursor = (insightCursor + attempt + 1) % INSIGHT_ORDER.length;
          break;
        }
      }
      nextAt = i + 1 + 6 + (hash(`n-${i}`) % 3);
    }
  });
  return out;
}

function makeInsight(
  type: FeedItem["card_type"],
  i: number,
  data: { gap: MacroGap | null; swap: SwapInfo | null; ctx: BuildFeedCtx },
): FeedItem | null {
  const key = `i-${type}-${i}`;
  switch (type) {
    case "macro_check":
      if (!data.gap) return null;
      return { card_type: "macro_check", key, gap: data.gap };
    case "ai_insight":
      if (!data.ctx.insight) return null;
      return { card_type: "ai_insight", key, insight: data.ctx.insight };
    case "streak_card":
      return {
        card_type: "streak_card",
        key,
        streak: data.ctx.streak,
        daysPlanned: data.ctx.daysPlanned,
      };
    case "swap_suggestion":
      if (!data.swap) return null;
      return { card_type: "swap_suggestion", key, swap: data.swap };
    case "progress_recap": {
      const top = data.gap?.largest ?? "protein";
      const coverage = data.ctx.goalDays
        ? Math.min(1, data.ctx.daysPlanned / data.ctx.goalDays)
        : 0;
      return {
        card_type: "progress_recap",
        key,
        planned: data.ctx.daysPlanned,
        goalDays: data.ctx.goalDays,
        topMacro: top,
        coverage,
      };
    }
    default:
      return null;
  }
}
