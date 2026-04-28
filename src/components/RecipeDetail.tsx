import { useEffect, useState } from "react";
import { X, Clock, Flame, ChefHat, Users, Plus, Check, ChevronDown } from "lucide-react";
import type { Recipe } from "@/data/recipes";
import { MacroBar } from "./MacroBar";
import { VerificationBadge } from "./VerificationBadge";
import { usePlanner, DAYS, type Day } from "@/store/planner";

type Props = {
  recipe: Recipe | null;
  onClose: () => void;
};

export function RecipeDetail({ recipe, onClose }: Props) {
  const { addToDay } = usePlanner();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [added, setAdded] = useState<Day | null>(null);

  useEffect(() => {
    if (!recipe) return;
    setPickerOpen(false);
    setAdded(null);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [recipe]);

  if (!recipe) return null;

  const handleAdd = (day: Day) => {
    addToDay(day, recipe.id);
    setAdded(day);
    setPickerOpen(false);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-background shadow-2xl animate-[slide-up_0.35s_ease-out]">
        {/* Hero */}
        <div className="relative h-[42dvh] min-h-[280px] w-full shrink-0 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            width={832}
            height={1216}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.05 0.01 240 / 0.4) 0%, transparent 35%, oklch(0.16 0.01 240) 100%)",
            }}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-foreground backdrop-blur transition active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)]">
            <VerificationBadge kind={recipe.verification} />
          </div>

          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              {recipe.category} · {recipe.tagline}
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-balance">
              {recipe.name}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-44 pt-5">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={<Clock className="h-4 w-4" />} label="Prep" value={`${recipe.prepMinutes}m`} />
            <Stat icon={<Users className="h-4 w-4" />} label="Servings" value={`${recipe.servings}`} />
            <Stat icon={<ChefHat className="h-4 w-4" />} label="Level" value={recipe.difficulty} />
          </div>

          {/* Macros */}
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Macros
            </h3>
            <div className="mt-3 rounded-2xl border border-white/5 bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold tabular-nums">{recipe.calories}</span>
                  <span className="text-sm text-muted-foreground">kcal</span>
                </div>
                <span className="text-xs text-muted-foreground">per serving</span>
              </div>
              <div className="mt-4">
                <MacroBar protein={recipe.protein} carbs={recipe.carbs} fat={recipe.fat} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Macro label="Protein" value={`${recipe.protein}g`} color="var(--protein)" />
                <Macro label="Carbs" value={`${recipe.carbs}g`} color="var(--carbs)" />
                <Macro label="Fat" value={`${recipe.fat}g`} color="var(--fat)" />
                <Macro label="Fiber" value={`${recipe.fiber}g`} color="var(--muted-foreground)" />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ingredients
            </h3>
            <ul className="mt-3 space-y-1 overflow-hidden rounded-2xl border border-white/5 bg-surface">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={ing.name + i}
                  className="flex items-start justify-between gap-3 border-b border-white/5 px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{ing.name}</p>
                    {ing.brand && (
                      <p className="text-[11px] uppercase tracking-wider text-primary/80">
                        ✓ {ing.brand}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prep Steps
            </h3>
            <ol className="mt-3 space-y-3">
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl border border-white/5 bg-surface p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sticky CTA dock */}
        <div className="absolute inset-x-0 bottom-0 border-t border-white/5 bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur-xl">
          {pickerOpen && (
            <div className="mb-3 overflow-hidden rounded-2xl border border-border bg-popover/95 p-2 shadow-2xl animate-fade-in">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pick a day
              </p>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleAdd(d)}
                    className="rounded-xl py-2.5 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-secondary px-4 py-4 text-base font-bold text-secondary-foreground transition active:scale-[0.98]"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground transition active:scale-[0.98] glow"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to {added}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add to Meal Prep
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/5 bg-surface p-3">
      <span className="text-primary">{icon}</span>
      <span className="text-base font-bold leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function Macro({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="h-1.5 w-6 rounded-full" style={{ background: color }} />
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
