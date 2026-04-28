import { useState } from "react";
import { Clock, Plus, Check } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import { RecipeImage } from "./RecipeImage";
import type { Recipe } from "@/data/recipes";

type Props = {
  recipe: Recipe;
  eager?: boolean;
  onOpen: (recipe: Recipe) => void;
  added?: boolean;
};

export function RecipeCard({ recipe, eager, onOpen, added }: Props) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 200);
    onOpen(recipe);
  };

  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <button
        type="button"
        onClick={handleTap}
        className={`absolute inset-0 h-full w-full text-left transition-transform duration-200 ${
          tapped ? "scale-[0.98]" : ""
        }`}
        aria-label={`Open ${recipe.name} details`}
      >
        <RecipeImage
          recipeId={recipe.id}
          recipeName={recipe.name}
          preferred={recipe.image}
          alt={recipe.name}
          eager={eager}
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-card)" }}
        />

        {/* Top row: verification badge */}
        <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-5 pt-[calc(env(safe-area-inset-top)+4.5rem)]">
          <VerificationBadge kind={recipe.verification} />
        </div>

        {added && (
          <div className="absolute right-5 top-[calc(env(safe-area-inset-top)+7.5rem)] flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            In your week
          </div>
        )}

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
              {recipe.prepMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              {recipe.servings} {recipe.servings === 1 ? "serving" : "servings"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 px-2.5 py-1.5 text-[11px] font-semibold text-white ring-1 ring-emerald-400/20 backdrop-blur-md">
              🥩 Protein <span className="tabular-nums">{recipe.protein}g</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/70 px-2.5 py-1.5 text-[11px] font-semibold text-white ring-1 ring-amber-400/20 backdrop-blur-md">
              🌾 Carbs <span className="tabular-nums">{recipe.carbs}g</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-950/70 px-2.5 py-1.5 text-[11px] font-semibold text-white ring-1 ring-indigo-400/20 backdrop-blur-md">
              🥑 Fat <span className="tabular-nums">{recipe.fat}g</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/10 backdrop-blur-md">
              🔥 <span className="tabular-nums">{recipe.calories}</span> kcal
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-black/30 px-4 py-3 text-sm font-semibold text-primary backdrop-blur-md">
            <Plus className="h-4 w-4" />
            Tap card for full recipe
          </div>
        </div>
      </button>
    </div>
  );
}
