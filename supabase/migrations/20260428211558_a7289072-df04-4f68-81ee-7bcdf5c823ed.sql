-- Profiles table tied to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Phase 1: About You
  age INTEGER,
  biological_sex TEXT,
  height_unit TEXT DEFAULT 'cm',
  height_cm INTEGER,
  height_ft INTEGER,
  height_in INTEGER,
  weight_unit TEXT DEFAULT 'kg',
  current_weight NUMERIC,
  target_weight NUMERIC,
  activity_level TEXT,
  gym_frequency TEXT,
  gym_focus TEXT,

  -- Phase 2: Your Goal
  goal TEXT NOT NULL DEFAULT 'maintain',
  goal_text TEXT,
  goal_why TEXT,
  timeline TEXT,

  -- Phase 3: Food
  favorite_proteins TEXT[] NOT NULL DEFAULT '{}',
  avoid_foods TEXT[] NOT NULL DEFAULT '{}',
  avoid_other TEXT,
  restrictions TEXT[] NOT NULL DEFAULT '{none}',
  spice_tolerance TEXT,

  -- Phase 4: Lifestyle
  cooking_frequency TEXT,
  skill TEXT NOT NULL DEFAULT 'intermediate',
  budget TEXT NOT NULL DEFAULT 'no_limit',
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  workout_timing TEXT,

  -- Phase 5: Anything else
  notes TEXT,

  -- AI plan output
  ai_plan JSONB,

  onboarded BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();