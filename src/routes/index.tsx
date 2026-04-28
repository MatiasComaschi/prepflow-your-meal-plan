import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, type Category, type Recipe } from "@/data/recipes";
import { fetchRecipesServerFn } from "@/server/recipes";
import { generateInsightServerFn } from "@/server/aiInsight.functions";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetail } from "@/components/RecipeDetail";
import { BottomNav } from "@/components/BottomNav";
import { MacroCheckCard } from "@/components/feed-cards/MacroCheckCard";
import { AIInsightCard } from "@/components/feed-cards/AIInsightCard";
import { StreakCard } from "@/components/feed-cards/StreakCard";
import { SwapSuggestionCard } from "@/components/feed-cards/SwapSuggestionCard";
import { ProgressRecapCard } from "@/components/feed-cards/ProgressRecapCard";
import { buildFeed } from "@/data/feed";
import { usePlanner } from "@/store/planner";
import { usePreferences } from "@/store/preferences";
import { supabase } from "@/integrations/supabase/client";
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
const GOAL_DAYS = 7;

function Page() {
  const [category, setCategory] = useState<Category>("Breakfast");
  const [active, setActive] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const baseOffsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { plan, daysPlanned, streak, weeklyTotals } = usePlanner();
  const { prefs, ready: prefsReady } = usePreferences();
  const inWeek = useMemo(() => {
    const set = new Set<string>();
    Object.values(plan).forEach((day) =>
      day.forEach((entry) => set.add(entry.recipeId)),
    );
    return set;
  }, [plan]);

  const filters = useMemo(
    () => ({
      goal: prefs.goal,
      restrictions: prefs.restrictions,
      skill: prefs.skill,
      budget: prefs.budget,
      aiPlan: prefs.aiPlan ?? null,
      mealsPerDay: prefs.mealsPerDay,
    }),
    [prefs.goal, prefs.restrictions, prefs.skill, prefs.budget, prefs.aiPlan, prefs.mealsPerDay],
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

  // Fresh feed when category OR preferences change.
  useEffect(() => {
    if (!prefsReady) return;
    if (!prefs.onboarded) return;
    const base = Math.floor(Math.random() * 200);
    baseOffsetRef.current = base;
    setRecipes([]);
    setOffset(base);
    setDone(false);
    scrollerRef.current?.scrollTo({ top: 0 });
    loadMore(category, base, true);
  }, [category, filterKey, prefsReady, prefs.onboarded, loadMore]);

  // Fetch AI insight once per filter change
  useEffect(() => {
    if (!prefsReady || !prefs.onboarded || !prefs.aiPlan) return;
    let cancelled = false;
    generateInsightServerFn({
      data: {
        goal: prefs.goal,
        goalText: prefs.goalText,
        protein_g: prefs.aiPlan.protein_g,
        carbs_g: prefs.aiPlan.carbs_g,
        fat_g: prefs.aiPlan.fat_g,
        daily_calories: prefs.aiPlan.daily_calories,
        recentTags: prefs.aiPlan.meal_keywords?.slice(0, 8) ?? [],
      },
    })
      .then((r) => {
        if (!cancelled) setInsight(r.insight);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filterKey, prefsReady, prefs.onboarded, prefs.aiPlan, prefs.goal, prefs.goalText]);

  // Infinite scroll
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

  // Build interleaved feed
  const feedItems = useMemo(
    () =>
      buildFeed(recipes, {
        aiPlan: prefs.aiPlan,
        weeklyTotals,
        daysPlanned,
        goalDays: GOAL_DAYS,
        streak,
        insight,
      }),
    [recipes, prefs.aiPlan, weeklyTotals, daysPlanned, streak, insight],
  );

  const handleMacroCTA = useCallback(() => {
    // Switch to a category likely to have higher protein meals
    setCategory("Lunch");
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSwapCTA = useCallback(() => {
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const progressPct = Math.min(100, (daysPlanned / GOAL_DAYS) * 100);

  return (
    <main className="relative mx-auto h-[100dvh] max-w-md overflow-hidden bg-background">
      <div
        ref={scrollerRef}
        key={category}
        className="snap-feed no-scrollbar h-full overflow-y-scroll"
      >
        {feedItems.map((item) => {
          switch (item.card_type) {
            case "recipe":
              return (
                <RecipeCard
                  key={item.key}
                  recipe={item.recipe}
                  eager={item.eager}
                  onOpen={setActive}
                  added={inWeek.has(item.recipe.id)}
                />
              );
            case "macro_check":
              return <MacroCheckCard key={item.key} gap={item.gap} onCTA={handleMacroCTA} />;
            case "ai_insight":
              return <AIInsightCard key={item.key} insight={item.insight} />;
            case "streak_card":
              return (
                <StreakCard key={item.key} streak={item.streak} daysPlanned={item.daysPlanned} />
              );
            case "swap_suggestion":
              return <SwapSuggestionCard key={item.key} swap={item.swap} onCTA={handleSwapCTA} />;
            case "progress_recap":
              return (
                <ProgressRecapCard
                  key={item.key}
                  planned={item.planned}
                  goalDays={item.goalDays}
                  topMacro={item.topMacro}
                  coverage={item.coverage}
                />
              );
            default:
              return null;
          }
        })}

        {feedItems.length === 0 && (
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

      {/* Top dock */}
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

        {/* Weekly meal-prep progress bar */}
        <div className="flex w-full items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-foreground/80">
            {daysPlanned}/{GOAL_DAYS} days
          </span>
        </div>

        {prefs.aiPlan?.reasoning && (
          <div className="pointer-events-auto flex w-full items-start gap-2 rounded-2xl border border-primary/20 bg-black/50 px-3 py-2 text-[11px] leading-snug text-foreground/90 backdrop-blur-md">
            <span className="mt-0.5 text-primary">✨</span>
            <span className="flex-1">{prefs.aiPlan.reasoning}</span>
          </div>
        )}
      </div>

      <BottomNav />

      <RecipeDetail recipe={active} onClose={() => setActive(null)} />
    </main>
  );
}
