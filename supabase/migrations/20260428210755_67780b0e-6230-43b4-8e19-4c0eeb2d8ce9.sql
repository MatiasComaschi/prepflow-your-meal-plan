CREATE OR REPLACE FUNCTION public.count_unseen_cached_recipes(
  _user_id UUID,
  _category TEXT,
  _tags TEXT[]
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
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