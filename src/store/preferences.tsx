import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Goal = "lose_fat" | "build_muscle" | "recomp" | "maintain";
export type MealsPerDay = 2 | 3 | 4 | 5;
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type Budget = "under_50" | "50_100" | "100_150" | "no_limit";
export type Restriction =
  | "none"
  | "no_dairy"
  | "no_gluten"
  | "vegetarian"
  | "vegan"
  | "no_pork"
  | "no_shellfish";

export type AIPlan = {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_keywords: string[];
  avoid: string[];
  reasoning: string;
};

export type Preferences = {
  goal: Goal;
  goalText?: string;
  aiPlan?: AIPlan | null;
  mealsPerDay: MealsPerDay;
  restrictions: Restriction[];
  skill: SkillLevel;
  budget: Budget;
  onboarded: boolean;
};

export const DEFAULT_PREFS: Preferences = {
  goal: "maintain",
  goalText: "",
  aiPlan: null,
  mealsPerDay: 3,
  restrictions: ["none"],
  skill: "intermediate",
  budget: "no_limit",
  onboarded: false,
};

const STORAGE_KEY = "prepflow.preferences.v1";

type Ctx = {
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  patch: (p: Partial<Preferences>) => void;
  reset: () => void;
  ready: boolean;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefsState({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs, ready]);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      ready,
      setPrefs: (p) => setPrefsState(p),
      patch: (p) => setPrefsState((cur) => ({ ...cur, ...p })),
      reset: () => setPrefsState(DEFAULT_PREFS),
    }),
    [prefs, ready],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: "lose_fat", label: "Lose fat", hint: "High protein, lower calories" },
  { value: "build_muscle", label: "Build muscle", hint: "High protein, higher calories" },
  { value: "recomp", label: "Body recomposition", hint: "Balanced, protein-forward" },
  { value: "maintain", label: "Maintain & eat clean", hint: "Whole foods, balanced macros" },
];

export const MEALS_OPTIONS: { value: MealsPerDay; label: string }[] = [
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5+" },
];

export const RESTRICTION_OPTIONS: { value: Restriction; label: string }[] = [
  { value: "none", label: "None" },
  { value: "no_dairy", label: "No dairy" },
  { value: "no_gluten", label: "No gluten" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "no_pork", label: "No pork" },
  { value: "no_shellfish", label: "No shellfish" },
];

export const SKILL_OPTIONS: { value: SkillLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Under 20 min" },
  { value: "intermediate", label: "Intermediate", hint: "Up to 45 min" },
  { value: "advanced", label: "Advanced", hint: "No time limit" },
];

export const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: "under_50", label: "Under $50" },
  { value: "50_100", label: "$50–100" },
  { value: "100_150", label: "$100–150" },
  { value: "no_limit", label: "No limit" },
];
