import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, type Category, type Recipe } from "@/data/recipes";
import { fetchRecipesServerFn } from "@/server/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetail } from "@/components/RecipeDetail";
import { BottomNav } from "@/components/BottomNav";
import { usePlanner } from "@/store/planner";
import { usePreferences } from "@/store/preferences";
import { Loader2 } from "lucide-react";

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

const PAGE_SIZE = 10;

function Page() {
  const [category, setCategory] = useState<Category>("Breakfast");
  const [active, setActive] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseOffsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { plan } = usePlanner();
  const { prefs, ready: prefsReady } = usePreferences();
  const inWeek = useMemo(() => {
    const set = new Set<string>();
    Object.values(plan).forEach((day) =>
      day.forEach((entry) => set.add(entry.recipeId)),
    );
    return set;
  }, [plan]);

  // Build a stable filter signature so changes trigger a refetch
  const filters = useMemo(
    () => ({
      goal: prefs.goal,
      restrictions: prefs.restrictions,
      skill: prefs.skill,
      budget: prefs.budget,
    }),
    [prefs.goal, prefs.restrictions, prefs.skill, prefs.budget],
  );
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadMore = useCallback(
    async (cat: Category, currentOffset: number, reset: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchRecipesServerFn({
          data: {
            category: cat,
            offset: currentOffset,
            number: PAGE_SIZE,
            filters: filtersRef.current,
          },
        });
        if (res.recipes.length === 0) {
          setDone(true);
        }
        setRecipes((prev) => {
          if (reset) return res.recipes;
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...res.recipes.filter((r) => !seen.has(r.id))];
        });
        setOffset(currentOffset + res.recipes.length);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fresh feed when category OR preferences change. Wait for prefs to hydrate.
  useEffect(() => {
    if (!prefsReady) return;
    if (!prefs.onboarded) return; // wait until onboarding completes
    const base = Math.floor(Math.random() * 200);
    baseOffsetRef.current = base;
    setRecipes([]);
    setOffset(base);
    setDone(false);
    scrollerRef.current?.scrollTo({ top: 0 });
    loadMore(category, base, true);
  }, [category, filterKey, prefsReady, prefs.onboarded, loadMore]);


  // Infinite scroll via IntersectionObserver inside the scroll container
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollerRef.current;
    if (!sentinel || !root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && !done) {
          loadMore(category, offset, false);
        }
      },
      { root, rootMargin: "400px" },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [category, offset, loading, done, loadMore]);

  return (
    <main className="relative mx-auto h-[100dvh] max-w-md overflow-hidden bg-background">
      <div
        ref={scrollerRef}
        key={category}
        className="snap-feed no-scrollbar h-full overflow-y-scroll"
      >
        {recipes.map((r, i) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            eager={i === 0}
            onOpen={setActive}
            added={inWeek.has(r.id)}
          />
        ))}

        {/* Empty state while first page loads */}
        {recipes.length === 0 && (
          <div className="snap-item flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm">Loading fresh recipes…</p>
              </>
            ) : error ? (
              <p className="px-8 text-center text-sm text-destructive">{error}</p>
            ) : (
              <p className="text-sm">No recipes found.</p>
            )}
          </div>
        )}

        {/* Sentinel + loader for infinite scroll */}
        {recipes.length > 0 && (
          <div
            ref={sentinelRef}
            className="snap-item flex h-32 w-full items-center justify-center text-muted-foreground"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : done ? (
              <span className="text-xs">You've reached the end</span>
            ) : (
              <span className="text-xs">Loading more…</span>
            )}
          </div>
        )}
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
