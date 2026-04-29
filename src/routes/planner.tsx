import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBasket, X, Check, Copy, CheckCircle2 } from "lucide-react";
import { usePlanner, DAYS, type Day } from "@/store/planner";
import { BottomNav } from "@/components/BottomNav";
import type { Category } from "@/data/recipes";

const PROTEIN_GOAL = 180;
const CALORIE_GOAL = 2200;
const MEAL_TARGET = 5;

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Weekly Planner — PrepFlow" },
      { name: "description", content: "Plan Monday–Sunday meals, track macros, and generate a shopping list." },
      { property: "og:title", content: "Weekly Planner — PrepFlow" },
      { property: "og:description", content: "Your week, your macros, your list." },
    ],
  }),
  component: Page,
});

function Page() {
  return <Planner />;
}

const CATEGORY_CHIP: Record<Category, string> = {
  Breakfast: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Lunch: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  Dinner: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30",
  Snack: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/30",
};

function Planner() {
  const { plan, getRecipe, totals, removeFromDay, shoppingList } = usePlanner();
  const [showList, setShowList] = useState(false);
  const [activeDay, setActiveDay] = useState<Day>("Mon");

  const list = shoppingList();
  const dayMeals = plan[activeDay];

  return (
    <main className="relative mx-auto min-h-[100dvh] max-w-md bg-background pb-40">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">PrepFlow</p>
        <h1 className="mt-1 text-3xl font-bold">Your Week</h1>

        {/* Day selector */}
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {DAYS.map((d) => {
            const t = totals(d);
            const isActive = activeDay === d;
            const planned = plan[d].length > 0;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`flex flex-none flex-col items-center justify-center rounded-2xl border transition ${
                  isActive
                    ? "min-w-[72px] scale-105 border-primary bg-primary/10 px-3 py-3 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
                    : "min-w-[60px] border-border bg-card px-3 py-2.5 text-foreground"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "text-primary" : "opacity-70"
                  }`}
                >
                  {d}
                </span>
                <span className="mt-1 flex h-2 items-center">
                  {planned ? (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-primary" : "bg-primary/80"
                      }`}
                    />
                  ) : (
                    <span className="h-2 w-2 rounded-full border border-border" />
                  )}
                </span>
                <span
                  className={`mt-1 text-[11px] tabular-nums ${
                    isActive ? "font-bold text-primary" : "text-muted-foreground"
                  }`}
                >
                  {t.calories ? `${t.calories}` : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Day card */}
      <section className="px-5 py-5">
        <DaySummary day={activeDay} mealCount={dayMeals.length} />

        <div className="mt-5 space-y-3">
          {dayMeals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">No meals planned for {activeDay}.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Head to Discover to add some.
              </p>
            </div>
          )}

          {dayMeals.map((entry) => {
            const r = getRecipe(entry.recipeId);
            if (!r) return null;
            return (
              <div
                key={entry.id}
                className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 pl-4"
              >
                {/* Lime committed border */}
                <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
                {/* Committed checkmark */}
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>

                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="h-16 w-16 flex-none rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${CATEGORY_CHIP[r.category]}`}
                    >
                      {r.category}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold">{r.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="tabular-nums">🔥 {r.calories} kcal</span>
                    <span className="opacity-50">·</span>
                    <span className="font-semibold text-primary tabular-nums">
                      🥩 {r.protein}g protein
                    </span>
                    <span className="opacity-50">·</span>
                    <span className="tabular-nums">⏱ {r.prepMinutes}m</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromDay(activeDay, entry.id)}
                  aria-label="Remove"
                  className="flex h-8 w-8 flex-none items-center justify-center self-end rounded-full text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating shopping list button */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40 flex justify-center px-5 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setShowList(true)}
          className="flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground glow active:scale-[0.98]"
        >
          <ShoppingBasket className="h-5 w-5" />
          Generate Shopping List
          {list.length > 0 && (
            <span className="ml-1 rounded-full bg-background px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary ring-1 ring-primary/40">
              {list.length}
            </span>
          )}
        </button>
      </div>

      <BottomNav />

      {showList && <ShoppingListSheet items={list} onClose={() => setShowList(false)} />}
    </main>
  );
}

function DaySummary({ day, mealCount }: { day: Day; mealCount: number }) {
  const { totals } = usePlanner();
  const t = totals(day);
  const proteinPct = Math.round((t.protein / PROTEIN_GOAL) * 100);
  const calPct = Math.min(100, Math.round((t.calories / CALORIE_GOAL) * 100));

  return (
    <div
      className="rounded-3xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daily total
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums">
            {t.calories}
            <span className="ml-1 text-base font-medium text-muted-foreground">kcal</span>
          </p>
        </div>
        <div className="text-right text-[11px] uppercase tracking-wider text-muted-foreground">
          <p>Goal</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{CALORIE_GOAL}</p>
        </div>
      </div>

      {/* Calorie bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${calPct}%` }}
        />
      </div>

      {/* Macro pills */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1.5 text-[11px] font-semibold text-primary ring-1 ring-primary/30">
          🥩 Protein <span className="tabular-nums">{t.protein}g</span>
          <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] tabular-nums">
            {proteinPct}% of goal
          </span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
          🌾 Carbs <span className="tabular-nums">{t.carbs}g</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-fuchsia-300 ring-1 ring-fuchsia-400/30">
          🥑 Fat <span className="tabular-nums">{t.fat}g</span>
        </span>
      </div>

      {/* Meal count row */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs font-semibold text-muted-foreground">
          Meals planned:{" "}
          <span className="text-foreground tabular-nums">
            {mealCount} of {MEAL_TARGET}
          </span>
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: MEAL_TARGET }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < mealCount ? "bg-primary" : "border border-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShoppingListSheet({
  items,
  onClose,
}: {
  items: { name: string; amounts: string[] }[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = items.map((i) => `• ${i.name} — ${i.amounts.join(", ")}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md animate-in slide-in-from-bottom rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              Shopping List
            </p>
            <h2 className="mt-1 text-2xl font-bold">{items.length} items</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-5">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Add meals to your week to build a list.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.name} className="flex items-center gap-3 py-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-border bg-background text-primary">
                    <Check className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{it.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {it.amounts.join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5">
          <button
            onClick={copy}
            disabled={items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground disabled:opacity-50"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copied ? "Copied" : "Copy list"}
          </button>
        </div>
      </div>
    </div>
  );
}
