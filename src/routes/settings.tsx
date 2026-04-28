import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
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

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PrepFlow" },
      { name: "description", content: "Update your goals, dietary preferences, and meal plan settings." },
      { property: "og:title", content: "Settings — PrepFlow" },
      { property: "og:description", content: "Tune your meal prep profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { prefs, setPrefs } = usePreferences();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Preferences>(prefs);

  const startEdit = () => {
    setDraft(prefs);
    setEditing(true);
  };

  const save = () => {
    setPrefs({ ...draft, onboarded: true });
    setEditing(false);
    // Refresh feed immediately
    navigate({ to: "/" });
  };

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

  const goalLabel = GOAL_OPTIONS.find((o) => o.value === prefs.goal)?.label ?? "—";
  const skillLabel = SKILL_OPTIONS.find((o) => o.value === prefs.skill)?.label ?? "—";
  const budgetLabel = BUDGET_OPTIONS.find((o) => o.value === prefs.budget)?.label ?? "—";
  const restrictionLabels = prefs.restrictions
    .map((r) => RESTRICTION_OPTIONS.find((o) => o.value === r)?.label ?? r)
    .join(", ");

  return (
    <main className="relative mx-auto h-[100dvh] max-w-md overflow-y-auto bg-background pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-lg font-bold">Settings</h1>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Edit Goals
          </button>
        )}
      </header>

      <div className="space-y-6 px-5 py-6">
        {!editing ? (
          <>
            <Section title="Your Profile">
              <Row label="Goal" value={goalLabel} />
              <Row label="Meals per day" value={String(prefs.mealsPerDay)} />
              <Row label="Restrictions" value={restrictionLabels} />
              <Row label="Skill level" value={skillLabel} />
              <Row label="Weekly budget" value={budgetLabel} />
            </Section>

            <p className="text-center text-xs text-muted-foreground">
              These settings drive every recipe in your feed.
            </p>
          </>
        ) : (
          <div className="space-y-7">
            <EditBlock title="Primary goal">
              {GOAL_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  selected={draft.goal === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, goal: opt.value }))}
                >
                  {opt.label}
                </Pill>
              ))}
            </EditBlock>

            <EditBlock title="Meals per day">
              {MEALS_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  selected={draft.mealsPerDay === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, mealsPerDay: opt.value }))}
                >
                  {opt.label}
                </Pill>
              ))}
            </EditBlock>

            <EditBlock title="Dietary restrictions">
              {RESTRICTION_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  selected={draft.restrictions.includes(opt.value)}
                  onClick={() => toggleRestriction(opt.value)}
                >
                  {opt.label}
                </Pill>
              ))}
            </EditBlock>

            <EditBlock title="Cooking skill">
              {SKILL_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  selected={draft.skill === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, skill: opt.value }))}
                >
                  {opt.label}
                </Pill>
              ))}
            </EditBlock>

            <EditBlock title="Weekly budget">
              {BUDGET_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  selected={draft.budget === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, budget: opt.value }))}
                >
                  {opt.label}
                </Pill>
              ))}
            </EditBlock>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setEditing(false)}
                className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={save}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Check className="h-4 w-4" />
                Save & refresh feed
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function EditBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
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
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
