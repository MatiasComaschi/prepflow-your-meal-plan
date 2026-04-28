import { createFileRoute } from "@tanstack/react-router";
import { RECIPES } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { BottomNav } from "@/components/BottomNav";
import { PlannerProvider } from "@/store/planner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrepFlow — Meal Prep, Reimagined" },
      {
        name: "description",
        content:
          "Scroll a feed of macro-verified recipes, plan your week, and generate a shopping list in seconds.",
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
  return (
    <PlannerProvider>
      <main className="relative mx-auto h-[100dvh] max-w-md overflow-hidden bg-background">
        <div className="snap-feed no-scrollbar h-full overflow-y-scroll">
          {RECIPES.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} eager={i === 0} />
          ))}
        </div>

        {/* Brand mark */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="rounded-full bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur">
            PrepFlow
          </span>
        </div>

        <BottomNav />
      </main>
    </PlannerProvider>
  );
}
