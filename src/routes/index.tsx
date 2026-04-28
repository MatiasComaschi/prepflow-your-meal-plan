import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RECIPES, CATEGORIES, type Category, type Recipe } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetail } from "@/components/RecipeDetail";
import { BottomNav } from "@/components/BottomNav";
import { usePlanner } from "@/store/planner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrepFlow — Meal Prep, Reimagined" },
      {
        name: "description",
        content:
          "Swipe a feed of macro-verified recipes, plan your week, and generate a shopping list in seconds.",
      },
      { property: "og:title", content: "PrepFlow — Meal Prep, Reimagined" },
      {
        property: "og:description",
        content: "Vertical recipe feed + weekly planner + auto shopping list.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [category, setCategory] = useState<Category>("Breakfast");
  const [active, setActive] = useState<Recipe | null>(null);
  const { plan } = usePlanner();

  const inWeek = useMemo(() => {
    const set = new Set<string>();
    Object.values(plan).forEach((day) =>
      day.forEach((entry) => set.add(entry.recipeId)),
    );
    return set;
  }, [plan]);

  const filtered = useMemo(
    () => RECIPES.filter((r) => r.category === category),
    [category],
  );

  return (
    <main className="relative mx-auto h-[100dvh] max-w-md overflow-hidden bg-background">
      {/* Snap feed */}
      <div
        key={category}
        className="snap-feed no-scrollbar h-full overflow-y-scroll"
      >
        {filtered.map((r, i) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            eager={i === 0}
            onOpen={setActive}
            added={inWeek.has(r.id)}
          />
        ))}
      </div>

      {/* Top dock: brand + category filter */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex flex-col items-center gap-2.5 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur">
          PrepFlow
        </span>
        <div className="pointer-events-auto no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-full bg-black/40 p-1 backdrop-blur-md">
          {CATEGORIES.map((c) => {
            const isActive = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />

      <RecipeDetail recipe={active} onClose={() => setActive(null)} />
    </main>
  );
}
