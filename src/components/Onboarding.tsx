import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, Loader2 } from "lucide-react";
import { AIOrb } from "@/components/onboarding/AIOrb";
import {
  usePreferences,
  GOAL_OPTIONS,
  MEALS_OPTIONS,
  RESTRICTION_OPTIONS,
  SKILL_OPTIONS,
  BUDGET_OPTIONS,
  SEX_OPTIONS,
  ACTIVITY_OPTIONS,
  GYM_FREQ_OPTIONS,
  GYM_FOCUS_OPTIONS,
  TIMELINE_OPTIONS,
  PROTEIN_OPTIONS,
  AVOID_OPTIONS,
  SPICE_OPTIONS,
  COOKING_FREQ_OPTIONS,
  WORKOUT_TIMING_OPTIONS,
  type Preferences,
  type Restriction,
} from "@/store/preferences";
import { analyzeGoalServerFn } from "@/server/aiPlan";

const PHASES = ["About You", "Your Goal", "Food", "Lifestyle", "Anything else?"] as const;

export function Onboarding() {
  const { prefs, setPrefs, ready } = usePreferences();
  const [draft, setDraft] = useState<Preferences>(prefs);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [completing, setCompleting] = useState(false);

  if (!ready) return null;
  if (prefs.onboarded) return null;

  const isLast = phaseIdx === PHASES.length - 1;
  const phaseTitle = PHASES[phaseIdx];

  const next = async () => {
    setError(null);
    setPulseKey((k) => k + 1);
    if (!isLast) {
      setPhaseIdx((i) => i + 1);
      return;
    }
    setAnalyzing(true);
    setCompleting(true);
    try {
      const res = await analyzeGoalServerFn({
        data: { profile: draftToProfile(draft) },
      });
      if (res.error) setError(res.error);
      // Hold the completion animation for ~2s minimum for the orb finale
      const minDelay = new Promise((r) => setTimeout(r, 2000));
      await minDelay;
      await setPrefs({ ...draft, aiPlan: res.plan ?? null, onboarded: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI analysis failed";
      setError(msg);
      await setPrefs({ ...draft, aiPlan: null, onboarded: true });
    } finally {
      setAnalyzing(false);
      setCompleting(false);
    }
  };

  const back = () => setPhaseIdx((i) => Math.max(0, i - 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= phaseIdx ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Phase {phaseIdx + 1} of {PHASES.length}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {phaseTitle}
          </div>
        </div>

        {/* Persistent AI orb */}
        <div className="mt-4 flex justify-center">
          <AIOrb
            phase={phaseIdx as 0 | 1 | 2 | 3 | 4}
            pulseKey={pulseKey}
            completing={completing}
            captionOverride={completing ? "your AI is ready" : undefined}
          />
        </div>

        <div className="mt-3 flex-1 overflow-y-auto no-scrollbar">
          {phaseIdx === 0 && <PhaseAbout draft={draft} setDraft={setDraft} />}
          {phaseIdx === 1 && <PhaseGoal draft={draft} setDraft={setDraft} />}
          {phaseIdx === 2 && <PhaseFood draft={draft} setDraft={setDraft} />}
          {phaseIdx === 3 && <PhaseLifestyle draft={draft} setDraft={setDraft} />}
          {phaseIdx === 4 && <PhaseExtra draft={draft} setDraft={setDraft} />}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={phaseIdx === 0 || analyzing}
            className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {isLast && (draft.notes ?? "").trim() === "" && !analyzing && (
            <button
              type="button"
              onClick={next}
              className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 text-xs font-semibold text-muted-foreground"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={analyzing}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing your profile…
              </>
            ) : isLast ? (
              <>
                <Check className="h-4 w-4" />
                Finish & build my feed
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Phase 1 ─────────────────────────
function PhaseAbout({
  draft,
  setDraft,
}: {
  draft: Preferences;
  setDraft: React.Dispatch<React.SetStateAction<Preferences>>;
}) {
  return (
    <Section title="About you" subtitle="Helps the AI compute your true energy needs.">
      <Field label="Age">
        <NumberInput
          value={draft.age ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, age: v }))}
          placeholder="e.g. 28"
          min={13}
          max={100}
        />
      </Field>

      <Field label="Biological sex">
        <PillRow>
          {SEX_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.biologicalSex === opt.value}
              onClick={() => setDraft((d) => ({ ...d, biologicalSex: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Height">
        <UnitToggle
          value={draft.heightUnit}
          onChange={(u) => setDraft((d) => ({ ...d, heightUnit: u as "cm" | "ft_in" }))}
          options={[
            { value: "cm", label: "cm" },
            { value: "ft_in", label: "ft / in" },
          ]}
        />
        {draft.heightUnit === "cm" ? (
          <NumberInput
            value={draft.heightCm ?? ""}
            onChange={(v) => setDraft((d) => ({ ...d, heightCm: v }))}
            placeholder="e.g. 178"
            min={100}
            max={250}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              value={draft.heightFt ?? ""}
              onChange={(v) => setDraft((d) => ({ ...d, heightFt: v }))}
              placeholder="ft"
              min={3}
              max={8}
            />
            <NumberInput
              value={draft.heightIn ?? ""}
              onChange={(v) => setDraft((d) => ({ ...d, heightIn: v }))}
              placeholder="in"
              min={0}
              max={11}
            />
          </div>
        )}
      </Field>

      <Field label="Current weight">
        <UnitToggle
          value={draft.weightUnit}
          onChange={(u) => setDraft((d) => ({ ...d, weightUnit: u as "kg" | "lbs" }))}
          options={[
            { value: "kg", label: "kg" },
            { value: "lbs", label: "lbs" },
          ]}
        />
        <NumberInput
          value={draft.currentWeight ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, currentWeight: v }))}
          placeholder={draft.weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
          min={30}
          max={400}
        />
      </Field>

      <Field label="Target weight">
        <NumberInput
          value={draft.targetWeight ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, targetWeight: v }))}
          placeholder={draft.weightUnit === "kg" ? "e.g. 72" : "e.g. 158"}
          min={30}
          max={400}
        />
      </Field>

      <Field label="Daily activity outside the gym">
        {ACTIVITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={draft.activityLevel === opt.value}
            onClick={() => setDraft((d) => ({ ...d, activityLevel: opt.value }))}
            title={opt.label}
            hint={opt.hint}
          />
        ))}
      </Field>

      <Field label="Gym frequency">
        <PillRow>
          {GYM_FREQ_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.gymFrequency === opt.value}
              onClick={() => setDraft((d) => ({ ...d, gymFrequency: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Gym focus">
        <PillRow>
          {GYM_FOCUS_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.gymFocus === opt.value}
              onClick={() => setDraft((d) => ({ ...d, gymFocus: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>
    </Section>
  );
}

// ───────────────────────── Phase 2 ─────────────────────────
function PhaseGoal({
  draft,
  setDraft,
}: {
  draft: Preferences;
  setDraft: React.Dispatch<React.SetStateAction<Preferences>>;
}) {
  return (
    <Section title="Your goal" subtitle="Tell us in your own words — the AI reads every word.">
      <Field label="Pick the closest fit">
        {GOAL_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={draft.goal === opt.value}
            onClick={() => setDraft((d) => ({ ...d, goal: opt.value }))}
            title={opt.label}
            hint={opt.hint}
          />
        ))}
      </Field>

      <Field label="In your own words, what are you trying to achieve?">
        <TextArea
          value={draft.goalText ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, goalText: v }))}
          placeholder="e.g. Lean down for a wedding in summer while keeping my squat numbers up…"
          rows={3}
        />
      </Field>

      <Field label="Why is this important to you right now?">
        <TextArea
          value={draft.goalWhy ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, goalWhy: v }))}
          placeholder="e.g. I want my energy back, and I'm tired of feeling sluggish after lunch…"
          rows={3}
        />
      </Field>

      <Field label="Timeline">
        <PillRow>
          {TIMELINE_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.timeline === opt.value}
              onClick={() => setDraft((d) => ({ ...d, timeline: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>
    </Section>
  );
}

// ───────────────────────── Phase 3 ─────────────────────────
function PhaseFood({
  draft,
  setDraft,
}: {
  draft: Preferences;
  setDraft: React.Dispatch<React.SetStateAction<Preferences>>;
}) {
  const toggleProtein = (p: string) =>
    setDraft((d) => ({
      ...d,
      favoriteProteins: d.favoriteProteins.includes(p)
        ? d.favoriteProteins.filter((x) => x !== p)
        : [...d.favoriteProteins, p],
    }));
  const toggleAvoid = (p: string) =>
    setDraft((d) => ({
      ...d,
      avoidFoods: d.avoidFoods.includes(p)
        ? d.avoidFoods.filter((x) => x !== p)
        : [...d.avoidFoods, p],
    }));
  const toggleRestriction = (r: Restriction) =>
    setDraft((d) => {
      let next = d.restrictions.includes(r)
        ? d.restrictions.filter((x) => x !== r)
        : [...d.restrictions.filter((x) => x !== "none"), r];
      if (r === "none") next = ["none"];
      if (next.length === 0) next = ["none"];
      return { ...d, restrictions: next };
    });

  return (
    <Section title="Food" subtitle="So the feed only shows recipes you'll actually cook.">
      <Field label="Favorite proteins (pick any)">
        <PillRow>
          {PROTEIN_OPTIONS.map((p) => (
            <Pill
              key={p}
              selected={draft.favoriteProteins.includes(p)}
              onClick={() => toggleProtein(p)}
            >
              {p}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Foods to avoid (pick any)">
        <PillRow>
          {AVOID_OPTIONS.map((p) => (
            <Pill key={p} selected={draft.avoidFoods.includes(p)} onClick={() => toggleAvoid(p)}>
              {p}
            </Pill>
          ))}
        </PillRow>
        <input
          type="text"
          value={draft.avoidOther ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, avoidOther: e.target.value }))}
          placeholder="Other foods to avoid…"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
      </Field>

      <Field label="Dietary restrictions">
        <PillRow>
          {RESTRICTION_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.restrictions.includes(opt.value)}
              onClick={() => toggleRestriction(opt.value)}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Spice tolerance">
        <PillRow>
          {SPICE_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.spiceTolerance === opt.value}
              onClick={() => setDraft((d) => ({ ...d, spiceTolerance: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>
    </Section>
  );
}

// ───────────────────────── Phase 4 ─────────────────────────
function PhaseLifestyle({
  draft,
  setDraft,
}: {
  draft: Preferences;
  setDraft: React.Dispatch<React.SetStateAction<Preferences>>;
}) {
  return (
    <Section title="Lifestyle" subtitle="We'll match recipe complexity to your week.">
      <Field label="How often do you cook?">
        {COOKING_FREQ_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            selected={draft.cookingFrequency === opt.value}
            onClick={() => setDraft((d) => ({ ...d, cookingFrequency: opt.value }))}
            title={opt.label}
          />
        ))}
      </Field>

      <Field label="Cooking skill">
        <PillRow>
          {SKILL_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.skill === opt.value}
              onClick={() => setDraft((d) => ({ ...d, skill: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Weekly grocery budget">
        <PillRow>
          {BUDGET_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.budget === opt.value}
              onClick={() => setDraft((d) => ({ ...d, budget: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Meals per day">
        <PillRow>
          {MEALS_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.mealsPerDay === opt.value}
              onClick={() => setDraft((d) => ({ ...d, mealsPerDay: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>

      <Field label="Workout timing">
        <PillRow>
          {WORKOUT_TIMING_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              selected={draft.workoutTiming === opt.value}
              onClick={() => setDraft((d) => ({ ...d, workoutTiming: opt.value }))}
            >
              {opt.label}
            </Pill>
          ))}
        </PillRow>
      </Field>
    </Section>
  );
}

// ───────────────────────── Phase 5 ─────────────────────────
function PhaseExtra({
  draft,
  setDraft,
}: {
  draft: Preferences;
  setDraft: React.Dispatch<React.SetStateAction<Preferences>>;
}) {
  return (
    <Section
      title="Anything else?"
      subtitle="Optional. Anything you want the AI nutritionist to know about you."
    >
      <TextArea
        value={draft.notes ?? ""}
        onChange={(v) => setDraft((d) => ({ ...d, notes: v }))}
        placeholder="e.g. I have lactose intolerance only with soft cheeses, prefer Mediterranean flavors, and travel for work twice a month…"
        rows={6}
      />
    </Section>
  );
}

// ───────────────────────── UI primitives ─────────────────────────
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-balance">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PillRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-muted-foreground/40"
      }`}
    >
      <div>
        <div className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
          {title}
        </div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {selected && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  value: number | "";
  onChange: (v: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value === "" ? "" : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Number(raw);
        if (Number.isNaN(n)) return;
        onChange(n);
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
    />
  );
}

function UnitToggle({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ───────────────────────── helpers ─────────────────────────
function draftToProfile(d: Preferences) {
  return {
    age: d.age,
    biologicalSex: d.biologicalSex,
    heightUnit: d.heightUnit,
    heightCm: d.heightCm,
    heightFt: d.heightFt,
    heightIn: d.heightIn,
    weightUnit: d.weightUnit,
    currentWeight: d.currentWeight,
    targetWeight: d.targetWeight,
    activityLevel: d.activityLevel,
    gymFrequency: d.gymFrequency,
    gymFocus: d.gymFocus,
    goal: d.goal,
    goalText: d.goalText,
    goalWhy: d.goalWhy,
    timeline: d.timeline,
    favoriteProteins: d.favoriteProteins,
    avoidFoods: d.avoidFoods,
    avoidOther: d.avoidOther,
    restrictions: d.restrictions,
    spiceTolerance: d.spiceTolerance,
    cookingFrequency: d.cookingFrequency,
    skill: d.skill,
    budget: d.budget,
    mealsPerDay: d.mealsPerDay,
    workoutTiming: d.workoutTiming,
    notes: d.notes,
  };
}

