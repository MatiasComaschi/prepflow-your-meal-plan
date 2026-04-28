## Goal

Turn the recipe feed into a mixed-content feed: every 6–8 swipes, inject one of five "insight" card types (`macro_check`, `ai_insight`, `streak_card`, `swap_suggestion`, `progress_recap`). Add a thin weekly meal-prep progress bar under the category chips.

## 1. Types & Feed Model

Create `src/data/feed.ts`:

```ts
export type FeedItem =
  | { card_type: "recipe"; key: string; recipe: Recipe }
  | { card_type: "macro_check"; key: string; gap: { protein:number; carbs:number; fat:number; calories:number } }
  | { card_type: "ai_insight"; key: string; insight: string }
  | { card_type: "streak_card"; key: string; streak: number }
  | { card_type: "swap_suggestion"; key: string; from: string; to: string; reason: string }
  | { card_type: "progress_recap"; key: string; planned: number; goalDays: number; topMacro: string };
```

A pure helper `buildFeed(recipes, ctx)` interleaves recipes with insight cards. Cadence: insert one insight card after every N recipes where N is `6 + (deterministicHash(key) % 3)` (so 6–8). Rotate through the 5 types in order, skipping any whose data isn't ready (e.g. no `ai_insight` yet → use `macro_check` instead). Deterministic so re-renders don't reshuffle.

## 2. Streak Tracking (Planner store)

Extend `src/store/planner.tsx`:
- Persist `plan` and a `streak` counter to `localStorage` (`prepflow.planner.v1`) — currently it's in-memory only, so streak would reset on reload.
- Derive `daysPlanned` = number of days in `plan` with ≥1 entry.
- Derive `streak` = consecutive weeks where `daysPlanned >= prefs.mealsPerDay-aware threshold`. For v1, simpler: store `lastWeekPlannedDays` and increment a counter when user crosses a threshold (≥3 days planned). Stored in localStorage with an ISO week key.
- Expose `daysPlanned`, `streak`, and `weeklyMacroTotals()` from the context.

## 3. AI Insight Server Function

New `src/server/aiInsight.functions.ts` (RPC) backed by `src/server/aiInsight.server.ts`:

```ts
generateInsightServerFn({ data: { prefs, recentSavedTags, recentViewedTags } })
  → { insight: string }
```

Uses Lovable AI `google/gemini-3-flash-preview` with system prompt:
> "You are a friendly AI nutritionist. Given the user's goal, macro targets, and which recipe tags they're saving/viewing most, write ONE short sentence (max 18 words) observing a behavior pattern and how the feed will adapt. No emojis, no preamble."

Returns plain text (not tool-calling — single sentence). Cached client-side: only refetched once per ~15 min and on prefs change. Errors return a benign fallback insight ("Tracking your taste — feed will keep adapting.").

## 4. Card Components

`src/components/feed-cards/` — one component per card type, each rendered inside a `snap-item` with the same full-viewport sizing as `RecipeCard`:

- **MacroCheckCard** — shows a mini macro coverage chart (protein/carbs/fat % of weekly target reached based on `weeklyMacroTotals` vs `prefs.aiPlan` × 7). Largest gap highlighted. CTA: "Find a {macroName}-rich meal" → switches category and scrolls to top.
- **AIInsightCard** — large quote-style sentence with a sparkle icon, gradient bg. Triggers `generateInsightServerFn` on mount if not pre-supplied.
- **StreakCard** — big number + flame icon + motivational line. Buttons: "Plan another day" (deeplinks to `/planner`).
- **SwapSuggestionCard** — derived locally, no AI call: picks a recipe the user keeps seeing whose macros poorly fit `aiPlan` (e.g. high-carb when goal is `lose_fat`) and suggests a swap from `aiPlan.meal_keywords`. CTA: "Show me {to}".
- **ProgressRecapCard** — weekly summary: `daysPlanned` / target days, top macro covered, and a Progress bar component.

Visual language matches RecipeCard: dark backdrop, primary accent, rounded pill CTAs. Distinct gradient per type so users recognize them at a glance.

## 5. Feed Integration (`src/routes/index.tsx`)

- Compute `feedItems = useMemo(() => buildFeed(recipes, { prefs, planner, streak, insight }), [...])`.
- Replace the `recipes.map(...)` render with `feedItems.map(item => switch(item.card_type) ...)`.
- The `IntersectionObserver` sentinel still triggers `loadMore` — it only fetches more recipes; insight cards are derived during render.
- The `eager` prop only applies to the first recipe card.

## 6. Weekly Progress Bar

In `src/routes/index.tsx`, just below the category chip row in the top dock:

```tsx
<div className="pointer-events-none flex w-full items-center gap-2 px-1">
  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
    <div className="h-full bg-primary transition-all" style={{ width: `${(daysPlanned/goalDays)*100}%` }} />
  </div>
  <span className="text-[10px] font-semibold text-white/80 tabular-nums">{daysPlanned}/{goalDays} days</span>
</div>
```

`goalDays` = 7 (or `prefs.mealsPerDay >= 4 ? 7 : 5` — start with 7). Updates reactively because it reads from `usePlanner()`.

## 7. AI Insight Trigger

In `Page`, lazily call `generateInsightServerFn` once `prefsReady && prefs.aiPlan`. Store the resulting sentence in `useState` so `buildFeed` can supply it to every `ai_insight` card slot. Re-trigger when `filterKey` changes (new goal/restrictions).

## Technical Notes

- `card_type` discriminator + `key` field enables stable React keys across mixed content.
- `buildFeed` is pure → memoizable, deterministic, no double-injection on re-renders.
- Streak/daysPlanned computed from planner state, so the progress bar updates instantly when a user adds a meal in `/planner`.
- All card components share `className="snap-item h-full w-full"` so scroll snap behaves identically.
- AI call is made at most once per session/filter change to keep cost low; SwapSuggestion is fully local.

## Files

Created:
- `src/data/feed.ts` (types + `buildFeed`)
- `src/server/aiInsight.server.ts`
- `src/server/aiInsight.functions.ts`
- `src/components/feed-cards/MacroCheckCard.tsx`
- `src/components/feed-cards/AIInsightCard.tsx`
- `src/components/feed-cards/StreakCard.tsx`
- `src/components/feed-cards/SwapSuggestionCard.tsx`
- `src/components/feed-cards/ProgressRecapCard.tsx`

Edited:
- `src/store/planner.tsx` (persistence + `daysPlanned` + `streak` + `weeklyMacroTotals`)
- `src/routes/index.tsx` (feedItems render, progress bar, insight fetch)
