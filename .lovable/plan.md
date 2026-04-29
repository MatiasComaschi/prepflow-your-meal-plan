## Goal

Persist the PrepFlow Context Brief into project memory so every future Lovable session automatically picks up the vision, locked architecture, voice, and anti-patterns — without me re-reading the upload.

## Memory structure

I'll split the brief into focused memory files (each one specific enough to judge relevance from the index) and put the universal, always-apply rules in the Core section of `mem://index.md`.

### `mem://index.md`

**Core** (always in context, applied to every action):
- Product: AI meal-prep planner for serious fitness users. Not a tracker, not a recipe browser. AI is silent infrastructure — never a chatbot, never an "ask AI" button.
- Voice: knowledgeable gym bro nutritionist. Direct, no corporate wellness, minimal emoji. "you're 30g protein short this week, want to fix it?" not "Looks like you may be slightly under 😊".
- Theme: dark mode, accent lime `#c8f461`, mint `#6ee7b7`, surface `#0a0a0a` / `#141414`. Sans for UI (DM Sans/Inter), JetBrains Mono for accents.
- Feed: TikTok-style vertical scroll-snap, one card per viewport, mixed card types every 6–8 swipes.
- AI runs ONCE on onboarding (or explicit goal update). Never on app open. Cache aggressively in Supabase.
- Founder wins conflicts. Push back with substance, not deference.

**Memories** (referenced files):
- [Architecture decisions](mem://features/architecture) — silent AI, sliding-scale cache, user_seen_recipes, image cache by ID, AI quality control, mixed card types
- [Onboarding phases](mem://features/onboarding) — 5 phases, fields per phase, why each exists, ≤90s ceiling
- [AI nutritionist contract](mem://features/ai-nutritionist) — system prompt JSON shape, when it runs
- [Cost optimization](mem://features/cost-optimization) — batching, lazy AI, cache TTLs, pg_cron pre-gen
- [Monetization](mem://features/monetization) — free tier limits, Pro $9.99/mo or $59.99/yr, paywall after 3 meals planned, affiliate is bonus not lead
- [Card aesthetic](mem://design/recipe-card) — full-bleed photo, macro pills, kcal pill, verification badge
- [Roadmap & build state](mem://features/roadmap) — done / in-progress / next priorities ordered list
- [Decision principles](mem://preferences/decision-principles) — retention > monetization, preserve AI moat, habit not tool
- [Anti-patterns](mem://constraints/anti-patterns) — no chatbot, no generic voice, no underpricing, no AI-on-app-open, no >90s onboarding
- [Tech stack](mem://reference/stack) — React in Lovable, Supabase, Lovable AI Gemini, Spoonacular, Stripe planned
- [Removed: AI orb](mem://constraints/removed-ai-orb) — onboarding orb removed, do not re-add as priority

### Files I will write

11 memory files (paths above) + the updated `mem://index.md`.

Each file uses the standard frontmatter (`name`, `description`, `type`) and contains the relevant slice of the brief, condensed to rules and specifics — not narrative.

## After approval

Switch to default mode and write all 12 files in one batch. No code changes to the app itself.
