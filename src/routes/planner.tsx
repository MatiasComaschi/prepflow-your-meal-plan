import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBasket, X, Flame, Check, Copy } from "lucide-react";
import { usePlanner, DAYS, type Day } from "@/store/planner";
import { MacroBar } from "@/components/MacroBar";
import { BottomNav } from "@/components/BottomNav";

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

function Planner() {
  const { plan, getRecipe, totals, removeFromDay, shoppingList } = usePlanner();
  const [showList, setShowList] = useState(false);
  const [activeDay, setActiveDay] = useState<Day>("Mon");

  const list = shoppingList();

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
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`flex min-w-[64px] flex-col items-center rounded-2xl border px-3 py-2.5 transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {d}
                </span>
                <span className="mt-0.5 text-base font-bold tabular-nums">
                  {t.calories || "—"}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Day card */}
      <section className="px-5 py-5">
        <DaySummary day={activeDay} />

        <div className="mt-5 space-y-3">
          {plan[activeDay].length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">No meals planned for {activeDay}.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Head to Discover to add some.
              </p>
            </div>
          )}

          {plan[activeDay].map((entry) => {
            const r = getRecipe(entry.recipeId);
            if (!r) return null;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="h-16 w-16 flex-none rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Flame className="h-3 w-3 text-primary" />
                    <span className="tabular-nums">{r.calories} kcal</span>
                    <span>·</span>
                    <span>{r.prepMinutes}m</span>
                  </div>
                  <div className="mt-2">
                    <MacroBar protein={r.protein} carbs={r.carbs} fat={r.fat} compact />
                  </div>
                </div>
                <button
                  onClick={() => removeFromDay(activeDay, entry.id)}
                  aria-label="Remove"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
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
            <span className="ml-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs tabular-nums">
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

function DaySummary({ day }: { day: Day }) {
  const { totals } = usePlanner();
  const t = totals(day);
  return (
    <div className="rounded-3xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
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
          <p className="text-sm font-semibold text-foreground tabular-nums">2 200</p>
        </div>
      </div>
      <div className="mt-4">
        <MacroBar protein={t.protein} carbs={t.carbs} fat={t.fat} />
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
