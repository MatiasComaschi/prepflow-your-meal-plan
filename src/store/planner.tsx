import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { RECIPES, type Recipe } from "@/data/recipes";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export type PlannerEntry = { id: string; recipeId: string };
export type Plan = Record<Day, PlannerEntry[]>;

const emptyPlan = (): Plan =>
  DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {} as Plan);

type Ctx = {
  plan: Plan;
  addToDay: (day: Day, recipeId: string) => void;
  removeFromDay: (day: Day, entryId: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
  totals: (day: Day) => { calories: number; protein: number; carbs: number; fat: number };
  shoppingList: () => { name: string; amounts: string[] }[];
};

const PlannerCtx = createContext<Ctx | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>(() => {
    // seed with a couple meals for delight
    const p = emptyPlan();
    p.Mon = [{ id: "seed1", recipeId: "b1" }, { id: "seed2", recipeId: "l1" }];
    p.Tue = [{ id: "seed3", recipeId: "l2" }];
    return p;
  });

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
    <PlannerCtx.Provider value={{ plan, addToDay, removeFromDay, getRecipe, totals, shoppingList }}>
      {children}
    </PlannerCtx.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerCtx);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}
