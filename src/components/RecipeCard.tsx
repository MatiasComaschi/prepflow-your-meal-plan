import { useState } from "react";
import { Clock, Flame, Plus, Check, ChevronDown } from "lucide-react";
import { MacroBar } from "./MacroBar";
import { VerificationBadge } from "./VerificationBadge";
import { usePlanner, DAYS, type Day } from "@/store/planner";
import type { Recipe } from "@/data/recipes";

export function RecipeCard({ recipe, eager }: { recipe: Recipe; eager?: boolean }) {
  const { addToDay } = usePlanner();
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<Day | null>(null);

  const handleAdd = (day: Day) => {
    addToDay(day, recipe.id);
    setAdded(day);
    setOpen(false);
    setTimeout(() => setAdded(null), 1600);
  };

  return (
    <div className="snap-item relative h-[100dvh] w-full overflow-hidden">
      <img
        src={recipe.image}
        alt={recipe.name}
        width={832}
        height={1216}
        loading={eager ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-card)" }}
      />

      {/* Top: badge */}
      <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <VerificationBadge kind={recipe.verification} />
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="tabular-nums">{recipe.calories}</span>
          <span className="text-muted-foreground">kcal</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 space-y-4 p-5 pb-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {recipe.tagline}
          </p>
          <h2 className="mt-1 text-3xl font-bold leading-tight text-balance">
            {recipe.name}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.prepMinutes} min prep
          </span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/30 p-4 backdrop-blur-md">
          <MacroBar protein={recipe.protein} carbs={recipe.carbs} fat={recipe.fat} />
        </div>

        {/* Add to week */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98] glow"
          >
            {added ? (
              <>
                <Check className="h-5 w-5" />
                Added to {added}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add to Week
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {open && (
            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-border bg-popover/95 p-2 shadow-2xl backdrop-blur-xl">
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
        </div>
      </div>
    </div>
  );
}
