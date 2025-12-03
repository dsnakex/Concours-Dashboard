-- Fix RLS Policies for user_preferences
-- This fixes the 406 error on /settings page

-- Enable RLS on user_preferences (if not already enabled)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Create new policies
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = id);

-- Verify concours table also has correct RLS
ALTER TABLE public.concours ENABLE ROW LEVEL SECURITY;

-- Drop and recreate concours policies
DROP POLICY IF EXISTS "Anyone can view active contests" ON public.concours;
DROP POLICY IF EXISTS "Authenticated users can insert contests" ON public.concours;
DROP POLICY IF EXISTS "Authenticated users can update contests" ON public.concours;

-- Everyone can view active contests
CREATE POLICY "Anyone can view active contests"
ON public.concours
FOR SELECT
USING (statut = 'actif' OR auth.role() = 'authenticated');

-- Authenticated users can insert contests (for scraper)
CREATE POLICY "Authenticated users can insert contests"
ON public.concours
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update contests
CREATE POLICY "Authenticated users can update contests"
ON public.concours
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify participations table RLS
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own participations" ON public.participations;
DROP POLICY IF EXISTS "Users can insert their own participations" ON public.participations;
DROP POLICY IF EXISTS "Users can update their own participations" ON public.participations;
DROP POLICY IF EXISTS "Users can delete their own participations" ON public.participations;

CREATE POLICY "Users can view their own participations"
ON public.participations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own participations"
ON public.participations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations"
ON public.participations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participations"
ON public.participations
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.concours TO authenticated;
GRANT ALL ON public.participations TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.ingest_logs TO authenticated;

-- Allow anon to view active contests
GRANT SELECT ON public.concours TO anon;
