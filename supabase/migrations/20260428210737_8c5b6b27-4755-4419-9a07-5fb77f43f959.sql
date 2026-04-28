-- Track which recipes each user has already seen in their feed
CREATE TABLE public.user_seen_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

CREATE INDEX idx_user_seen_recipes_user ON public.user_seen_recipes(user_id);
CREATE INDEX idx_user_seen_recipes_user_recipe ON public.user_seen_recipes(user_id, recipe_id);

ALTER TABLE public.user_seen_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own seen recipes"
ON public.user_seen_recipes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seen recipes"
ON public.user_seen_recipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seen recipes"
ON public.user_seen_recipes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Helper RPC: count cached recipes matching tags + category for a user, excluding seen
CREATE OR REPLACE FUNCTION public.count_unseen_cached_recipes(
  _user_id UUID,
  _category TEXT,
  _tags TEXT[]
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.cached_recipes cr
  WHERE cr.category = _category
    AND (COALESCE(array_length(_tags, 1), 0) = 0 OR cr.tags && _tags)
    AND NOT EXISTS (
      SELECT 1 FROM public.user_seen_recipes usr
      WHERE usr.user_id = _user_id AND usr.recipe_id = cr.id
    );
$$;