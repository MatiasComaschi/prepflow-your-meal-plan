import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, Loader2 } from "lucide-react";
import {
  usePreferences,
  GOAL_OPTIONS,
  MEALS_OPTIONS,
  RESTRICTION_OPTIONS,
  SKILL_OPTIONS,
  BUDGET_OPTIONS,
  type Preferences,
  type Restriction,
} from "@/store/preferences";
import { analyzeGoalServerFn } from "@/server/aiPlan";

const STEPS = ["goal", "meals", "restrictions", "skill", "budget"] as const;
type Step = (typeof STEPS)[number];

export function Onboarding() {
  const { prefs, setPrefs, ready } = usePreferences();
  const [draft, setDraft] = useState<Preferences>(prefs);
  const [stepIdx, setStepIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  if (!ready) return null;
  if (prefs.onboarded) return null;

  const step: Step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const next = async () => {
    if (isLast) {
      setAnalyzing(true);
      let aiPlan = null;
      try {
        const res = await analyzeGoalServerFn({
          data: { goalText: draft.goalText?.trim() || `${draft.goal}` },
        });
        aiPlan = res.plan;
      } catch (e) {
        console.error("AI analyze failed", e);
      } finally {
        setAnalyzing(false);
      }
      setPrefs({ ...draft, aiPlan, onboarded: true });
    } else {
      setStepIdx((i) => i + 1);
    }
  };
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const toggleRestriction = (r: Restriction) => {
    setDraft((d) => {
      let next = d.restrictions.includes(r)
        ? d.restrictions.filter((x) => x !== r)
        : [...d.restrictions.filter((x) => x !== "none"), r];
      if (r === "none") next = ["none"];
      if (next.length === 0) next = ["none"];
      return { ...d, restrictions: next };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIdx ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome to PrepFlow
        </div>

        <div className="mt-3 flex-1 overflow-y-auto no-scrollbar">
          {step === "goal" && (
            <Question
              title="What's your primary goal?"
              subtitle="We'll tune calories and protein for you."
            >
              {GOAL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={draft.goal === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, goal: opt.value }))}
                  title={opt.label}
                  hint={opt.hint}
                />
              ))}
            </Question>
          )}

          {step === "meals" && (
            <Question
              title="How many meals per day?"
              subtitle="We'll pace your weekly plan accordingly."
            >
              <div className="grid grid-cols-4 gap-2">
                {MEALS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDraft((d) => ({ ...d, mealsPerDay: opt.value }))}
                    className={`rounded-2xl border px-3 py-5 text-lg font-bold transition ${
                      draft.mealsPerDay === opt.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === "restrictions" && (
            <Question
              title="Any dietary restrictions?"
              subtitle="Pick all that apply."
            >
              {RESTRICTION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={draft.restrictions.includes(opt.value)}
                  onClick={() => toggleRestriction(opt.value)}
                  title={opt.label}
                />
              ))}
            </Question>
          )}

          {step === "skill" && (
            <Question
              title="Cooking skill level?"
              subtitle="We'll filter recipes by total prep time."
            >
              {SKILL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={draft.skill === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, skill: opt.value }))}
                  title={opt.label}
                  hint={opt.hint}
                />
              ))}
            </Question>
          )}

          {step === "budget" && (
            <Question
              title="Weekly grocery budget?"
              subtitle="Influences ingredient complexity."
            >
              {BUDGET_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={draft.budget === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, budget: opt.value }))}
                  title={opt.label}
                />
              ))}
            </Question>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stepIdx === 0}
            className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
          >
            {isLast ? (
              <>
                <Check className="h-4 w-4" />
                Start cooking
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

function Question({
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
      <div className="space-y-2">{children}</div>
    </div>
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
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-muted-foreground/40"
      }`}
    >
      <div>
        <div className={`text-base font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
          {title}
        </div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>
    </button>
  );
}
