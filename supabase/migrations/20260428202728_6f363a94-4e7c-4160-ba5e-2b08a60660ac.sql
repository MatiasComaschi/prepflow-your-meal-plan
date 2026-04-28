-- Cached recipes table
CREATE TABLE IF NOT EXISTS public.cached_recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'spoonacular',
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  fiber INTEGER NOT NULL DEFAULT 0,
  prep_minutes INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'Easy',
  confidence INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_recipes_tags ON public.cached_recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_cached_recipes_category ON public.cached_recipes(category);
CREATE INDEX IF NOT EXISTS idx_cached_recipes_calories ON public.cached_recipes(calories);
CREATE INDEX IF NOT EXISTS idx_cached_recipes_hits ON public.cached_recipes(hits DESC);
CREATE INDEX IF NOT EXISTS idx_cached_recipes_confidence ON public.cached_recipes(confidence);

ALTER TABLE public.cached_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cached recipes readable by everyone"
  ON public.cached_recipes FOR SELECT
  USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_cached_recipes_updated_at ON public.cached_recipes;
CREATE TRIGGER update_cached_recipes_updated_at
  BEFORE UPDATE ON public.cached_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Public storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on recipe-images
CREATE POLICY "Recipe images readable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');
