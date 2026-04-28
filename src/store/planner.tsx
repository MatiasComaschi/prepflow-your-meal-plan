import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { RECIPES, type Recipe } from "@/data/recipes";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export type PlannerEntry = { id: string; recipeId: string };
export type Plan = Record<Day, PlannerEntry[]>;

const emptyPlan = (): Plan =>
  DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {} as Plan);

type StreakState = { count: number; weekKey: string };

type Ctx = {
  plan: Plan;
  addToDay: (day: Day, recipeId: string) => void;
  removeFromDay: (day: Day, entryId: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
  totals: (day: Day) => { calories: number; protein: number; carbs: number; fat: number };
  shoppingList: () => { name: string; amounts: string[] }[];
  daysPlanned: number;
  streak: number;
  weeklyTotals: { calories: number; protein: number; carbs: number; fat: number };
};

const PlannerCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "prepflow.planner.v1";
const STREAK_KEY = "prepflow.streak.v1";
const STREAK_THRESHOLD = 3;

function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNum}`;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>(() => {
    const p = emptyPlan();
    p.Mon = [{ id: "seed1", recipeId: "b1" }, { id: "seed2", recipeId: "l1" }];
    p.Tue = [{ id: "seed3", recipeId: "l2" }];
    return p;
  });
  const [streakState, setStreakState] = useState<StreakState>({
    count: 0,
    weekKey: isoWeekKey(),
  });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setPlan({ ...emptyPlan(), ...JSON.parse(raw) });
      const sraw = typeof window !== "undefined" ? localStorage.getItem(STREAK_KEY) : null;
      if (sraw) setStreakState(JSON.parse(sraw));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist plan
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {}
  }, [plan, hydrated]);

  const daysPlanned = useMemo(
    () => DAYS.reduce((n, d) => n + (plan[d].length > 0 ? 1 : 0), 0),
    [plan],
  );

  // Update streak when threshold crossed in current ISO week
  useEffect(() => {
    if (!hydrated) return;
    const wk = isoWeekKey();
    setStreakState((cur) => {
      let next = cur;
      if (cur.weekKey !== wk) {
        // new week — keep count if previous week met threshold (we don't know historical days); reset weekKey
        next = { count: cur.count, weekKey: wk };
      }
      if (daysPlanned >= STREAK_THRESHOLD && next.weekKey === wk) {
        // mark this week as counted (idempotent — store flag inside count; we use a separate flag in localStorage)
        const flagKey = `${STREAK_KEY}.counted.${wk}`;
        const counted = typeof window !== "undefined" ? localStorage.getItem(flagKey) : "1";
        if (!counted) {
          next = { count: next.count + 1, weekKey: wk };
          try {
            localStorage.setItem(flagKey, "1");
          } catch {}
        }
      }
      try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [daysPlanned, hydrated]);

  const addToDay = useCallback((day: Day, recipeId: string) => {
    setPlan((p) => ({
      ...p,
      [day]: [...p[day], { id: `${Date.now()}-${Math.random()}`, recipeId }],
    }));
  }, []);

  const removeFromDay = useCallback((day: Day, entryId: string) => {
    setPlan((p) => ({ ...p, [day]: p[day].filter((e) => e.id !== entryId) }));
  }, []);

  const getRecipe = useCallback((id: string) => RECIPES.find((r) => r.id === id), []);

  const totals = useCallback(
    (day: Day) => {
      return plan[day].reduce(
        (t, e) => {
          const r = RECIPES.find((x) => x.id === e.recipeId);
          if (!r) return t;
          return {
            calories: t.calories + r.calories,
            protein: t.protein + r.protein,
            carbs: t.carbs + r.carbs,
            fat: t.fat + r.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
    },
    [plan],
  );

  const weeklyTotals = useMemo(
    () =>
      DAYS.reduce(
        (t, d) => {
          const dt = totals(d);
          return {
            calories: t.calories + dt.calories,
            protein: t.protein + dt.protein,
            carbs: t.carbs + dt.carbs,
            fat: t.fat + dt.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [plan, totals],
  );

  const shoppingList = useCallback(() => {
    const map = new Map<string, string[]>();
    DAYS.forEach((d) => {
      plan[d].forEach((e) => {
        const r = RECIPES.find((x) => x.id === e.recipeId);
        if (!r) return;
        r.ingredients.forEach((ing) => {
          const cur = map.get(ing.name) ?? [];
          cur.push(ing.amount);
          map.set(ing.name, cur);
        });
      });
    });
    return Array.from(map.entries()).map(([name, amounts]) => ({ name, amounts }));
  }, [plan]);

  return (
    <PlannerCtx.Provider
      value={{
        plan,
        addToDay,
        removeFromDay,
        getRecipe,
        totals,
        shoppingList,
        daysPlanned,
        streak: streakState.count,
        weeklyTotals,
      }}
    >
      {children}
    </PlannerCtx.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerCtx);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}
