import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// ───────────────────────── Types ─────────────────────────
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

export type BiologicalSex = "male" | "female" | "prefer_not_say";
export type HeightUnit = "cm" | "ft_in";
export type WeightUnit = "kg" | "lbs";
export type ActivityLevel = "sedentary" | "lightly_active" | "very_active";
export type GymFrequency = "none" | "1_2" | "3_4" | "5_plus";
export type GymFocus = "weights" | "cardio" | "both" | "na";
export type Timeline = "4_weeks" | "3_months" | "6_months" | "no_rush";
export type SpiceTolerance = "mild" | "medium" | "hot";
export type CookingFrequency = "daily" | "few_week" | "weekend_prep" | "rarely";
export type WorkoutTiming = "morning" | "midday" | "evening" | "varies" | "none";

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
  // About
  age?: number | null;
  biologicalSex?: BiologicalSex | null;
  heightUnit: HeightUnit;
  heightCm?: number | null;
  heightFt?: number | null;
  heightIn?: number | null;
  weightUnit: WeightUnit;
  currentWeight?: number | null;
  targetWeight?: number | null;
  activityLevel?: ActivityLevel | null;
  gymFrequency?: GymFrequency | null;
  gymFocus?: GymFocus | null;

  // Goal
  goal: Goal;
  goalText?: string;
  goalWhy?: string;
  timeline?: Timeline | null;

  // Food
  favoriteProteins: string[];
  avoidFoods: string[];
  avoidOther?: string;
  restrictions: Restriction[];
  spiceTolerance?: SpiceTolerance | null;

  // Lifestyle
  cookingFrequency?: CookingFrequency | null;
  skill: SkillLevel;
  budget: Budget;
  mealsPerDay: MealsPerDay;
  workoutTiming?: WorkoutTiming | null;

  // Notes
  notes?: string;

  // AI plan output
  aiPlan?: AIPlan | null;
  onboarded: boolean;
};

export const DEFAULT_PREFS: Preferences = {
  age: null,
  biologicalSex: null,
  heightUnit: "cm",
  heightCm: null,
  heightFt: null,
  heightIn: null,
  weightUnit: "kg",
  currentWeight: null,
  targetWeight: null,
  activityLevel: null,
  gymFrequency: null,
  gymFocus: null,

  goal: "maintain",
  goalText: "",
  goalWhy: "",
  timeline: null,

  favoriteProteins: [],
  avoidFoods: [],
  avoidOther: "",
  restrictions: ["none"],
  spiceTolerance: null,

  cookingFrequency: null,
  skill: "intermediate",
  budget: "no_limit",
  mealsPerDay: 3,
  workoutTiming: null,

  notes: "",
  aiPlan: null,
  onboarded: false,
};

// ───────────────────────── Row mapping ─────────────────────────
function rowToPrefs(row: any): Preferences {
  return {
    age: row.age ?? null,
    biologicalSex: row.biological_sex ?? null,
    heightUnit: (row.height_unit ?? "cm") as HeightUnit,
    heightCm: row.height_cm ?? null,
    heightFt: row.height_ft ?? null,
    heightIn: row.height_in ?? null,
    weightUnit: (row.weight_unit ?? "kg") as WeightUnit,
    currentWeight: row.current_weight ?? null,
    targetWeight: row.target_weight ?? null,
    activityLevel: row.activity_level ?? null,
    gymFrequency: row.gym_frequency ?? null,
    gymFocus: row.gym_focus ?? null,

    goal: (row.goal ?? "maintain") as Goal,
    goalText: row.goal_text ?? "",
    goalWhy: row.goal_why ?? "",
    timeline: row.timeline ?? null,

    favoriteProteins: row.favorite_proteins ?? [],
    avoidFoods: row.avoid_foods ?? [],
    avoidOther: row.avoid_other ?? "",
    restrictions: (row.restrictions ?? ["none"]) as Restriction[],
    spiceTolerance: row.spice_tolerance ?? null,

    cookingFrequency: row.cooking_frequency ?? null,
    skill: (row.skill ?? "intermediate") as SkillLevel,
    budget: (row.budget ?? "no_limit") as Budget,
    mealsPerDay: (row.meals_per_day ?? 3) as MealsPerDay,
    workoutTiming: row.workout_timing ?? null,

    notes: row.notes ?? "",
    aiPlan: row.ai_plan ?? null,
    onboarded: !!row.onboarded,
  };
}

function prefsToRow(p: Preferences): Record<string, any> {
  return {
    age: p.age,
    biological_sex: p.biologicalSex,
    height_unit: p.heightUnit,
    height_cm: p.heightCm,
    height_ft: p.heightFt,
    height_in: p.heightIn,
    weight_unit: p.weightUnit,
    current_weight: p.currentWeight,
    target_weight: p.targetWeight,
    activity_level: p.activityLevel,
    gym_frequency: p.gymFrequency,
    gym_focus: p.gymFocus,

    goal: p.goal,
    goal_text: p.goalText ?? "",
    goal_why: p.goalWhy ?? "",
    timeline: p.timeline,

    favorite_proteins: p.favoriteProteins,
    avoid_foods: p.avoidFoods,
    avoid_other: p.avoidOther ?? "",
    restrictions: p.restrictions,
    spice_tolerance: p.spiceTolerance,

    cooking_frequency: p.cookingFrequency,
    skill: p.skill,
    budget: p.budget,
    meals_per_day: p.mealsPerDay,
    workout_timing: p.workoutTiming,

    notes: p.notes ?? "",
    ai_plan: p.aiPlan,
    onboarded: p.onboarded,
  };
}

// ───────────────────────── Context ─────────────────────────
type Ctx = {
  prefs: Preferences;
  setPrefs: (p: Preferences) => Promise<void>;
  patch: (p: Partial<Preferences>) => Promise<void>;
  reset: () => void;
  ready: boolean;
  session: Session | null;
  signedIn: boolean;
  signOut: () => Promise<void>;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Track session
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      userIdRef.current = s?.user?.id ?? null;
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      userIdRef.current = data.session?.user?.id ?? null;
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile when session changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const userId = session?.user?.id;
      if (!userId) {
        if (!cancelled) {
          setPrefsState(DEFAULT_PREFS);
          setReady(true);
        }
        return;
      }
      setReady(false);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("load profile error", error.message);
        setPrefsState(DEFAULT_PREFS);
      } else if (data) {
        setPrefsState(rowToPrefs(data));
      } else {
        setPrefsState(DEFAULT_PREFS);
      }
      setReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const persist = useCallback(async (p: Preferences) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update(prefsToRow(p))
      .eq("user_id", userId);
    if (error) console.error("save profile error", error.message);
  }, []);

  const setPrefs = useCallback(
    async (p: Preferences) => {
      setPrefsState(p);
      await persist(p);
    },
    [persist],
  );

  const patch = useCallback(
    async (p: Partial<Preferences>) => {
      const next = { ...prefs, ...p };
      setPrefsState(next);
      await persist(next);
    },
    [prefs, persist],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPrefsState(DEFAULT_PREFS);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      setPrefs,
      patch,
      reset: () => setPrefsState(DEFAULT_PREFS),
      ready,
      session,
      signedIn: !!session,
      signOut,
    }),
    [prefs, ready, session, setPrefs, patch, signOut],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

// ───────────────────────── Option lists ─────────────────────────
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

export const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: "sedentary", label: "Sedentary", hint: "Desk job, mostly sitting" },
  { value: "lightly_active", label: "Lightly active", hint: "On feet often, walks daily" },
  { value: "very_active", label: "Very active", hint: "Manual job or very mobile" },
];

export const GYM_FREQ_OPTIONS: { value: GymFrequency; label: string }[] = [
  { value: "none", label: "None" },
  { value: "1_2", label: "1–2× / week" },
  { value: "3_4", label: "3–4× / week" },
  { value: "5_plus", label: "5+× / week" },
];

export const GYM_FOCUS_OPTIONS: { value: GymFocus; label: string }[] = [
  { value: "weights", label: "Weights" },
  { value: "cardio", label: "Cardio" },
  { value: "both", label: "Both" },
  { value: "na", label: "N/A" },
];

export const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "4_weeks", label: "4 weeks" },
  { value: "3_months", label: "3 months" },
  { value: "6_months", label: "6 months" },
  { value: "no_rush", label: "No rush" },
];

export const PROTEIN_OPTIONS = [
  "Chicken",
  "Beef",
  "Fish",
  "Eggs",
  "Tofu",
  "Shrimp",
  "Pork",
  "Turkey",
  "Plant-based",
  "Other",
];

export const AVOID_OPTIONS = [
  "Mushrooms",
  "Cilantro",
  "Liver",
  "Olives",
  "Anchovies",
  "Blue cheese",
  "Beets",
  "Eggplant",
  "Tofu",
  "Tomatoes",
];

export const SPICE_OPTIONS: { value: SpiceTolerance; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
];

export const COOKING_FREQ_OPTIONS: { value: CookingFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "few_week", label: "Few times a week" },
  { value: "weekend_prep", label: "Weekend meal prep" },
  { value: "rarely", label: "Rarely" },
];

export const WORKOUT_TIMING_OPTIONS: { value: WorkoutTiming; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
  { value: "varies", label: "Varies" },
  { value: "none", label: "Don't work out" },
];
