-- Contest AI Platform - Initial Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User preferences table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR,
  phone VARCHAR,
  types_participation_affichees VARCHAR[] DEFAULT ARRAY['direct', 'quiz', 'tirage'],
  types_participation_masquees VARCHAR[] DEFAULT ARRAY['reseaux_sociaux', 'achat'],
  categories_interessantes VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
  langue VARCHAR DEFAULT 'fr',
  theme VARCHAR DEFAULT 'light',
  total_participations INT DEFAULT 0,
  total_gagnes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Concours table
CREATE TABLE IF NOT EXISTS public.concours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Métadonnées principales
  titre VARCHAR NOT NULL,
  marque VARCHAR,
  description TEXT,
  lien_source VARCHAR UNIQUE NOT NULL,
  source VARCHAR DEFAULT 'manual',

  -- Dates critiques
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  date_ajout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Classification
  type_participation VARCHAR NOT NULL,
  categorie_lot VARCHAR,

  -- Effort & Value
  temps_estime INT DEFAULT 0,
  valeur_estimee INT DEFAULT 0,
  nombre_lots INT DEFAULT 1,

  -- Conditions résumées
  conditions_resumees TEXT,
  achat_obligatoire BOOLEAN DEFAULT FALSE,
  pays_eligibles VARCHAR[] DEFAULT ARRAY['FR'],
  age_min INT,

  -- IA Scoring
  score_pertinence FLOAT DEFAULT 0,
  raison_score TEXT,

  -- Status
  statut VARCHAR DEFAULT 'actif',
  clicks_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (statut IN ('actif', 'clos', 'spam', 'archived')),
  CONSTRAINT valid_type CHECK (type_participation IN ('direct', 'reseaux_sociaux', 'quiz', 'creativ', 'achat', 'tirage')),
  CONSTRAINT valid_categorie CHECK (categorie_lot IN ('voyage', 'tech', 'argent', 'enfants', 'autre') OR categorie_lot IS NULL)
);

-- Participations table
CREATE TABLE IF NOT EXISTS public.participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concours_id UUID NOT NULL REFERENCES public.concours(id) ON DELETE CASCADE,

  -- Status
  statut VARCHAR DEFAULT 'a_faire',
  date_participation TIMESTAMP WITH TIME ZONE,
  notes TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, concours_id),
  CONSTRAINT valid_statut CHECK (statut IN ('a_faire', 'fait', 'gagne', 'perdu', 'ignore'))
);

-- Ingest logs (admin tracking)
CREATE TABLE IF NOT EXISTS public.ingest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imported INT DEFAULT 0,
  duplicates INT DEFAULT 0,
  errors TEXT[],
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_concours_date_fin ON public.concours(date_fin DESC);
CREATE INDEX IF NOT EXISTS idx_concours_type ON public.concours(type_participation);
CREATE INDEX IF NOT EXISTS idx_concours_categorie ON public.concours(categorie_lot);
CREATE INDEX IF NOT EXISTS idx_concours_score ON public.concours(score_pertinence DESC);
CREATE INDEX IF NOT EXISTS idx_concours_statut ON public.concours(statut);
CREATE INDEX IF NOT EXISTS idx_participations_user ON public.participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_statut ON public.participations(statut);
CREATE INDEX IF NOT EXISTS idx_participations_concours ON public.participations(concours_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingest_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for concours
-- All users can read active contests
CREATE POLICY "Contests are readable by everyone"
  ON public.concours
  FOR SELECT
  USING (true);

-- Only admins can insert/update contests
CREATE POLICY "Only admins can insert contests"
  ON public.concours
  FOR INSERT
  WITH CHECK (false); -- Will be updated with admin role later

-- RLS Policies for participations
-- Users can only see their own participations
CREATE POLICY "Users can only see their participations"
  ON public.participations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own participations
CREATE POLICY "Users can create their own participations"
  ON public.participations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participations
CREATE POLICY "Users can update their own participations"
  ON public.participations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own participations
CREATE POLICY "Users can delete their own participations"
  ON public.participations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
-- Users can read their own preferences
CREATE POLICY "Users can read their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for ingest_logs (admin only)
CREATE POLICY "Only admins can read ingest logs"
  ON public.ingest_logs
  FOR SELECT
  USING (false); -- Will be updated with admin role later

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_concours_updated_at BEFORE UPDATE ON public.concours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participations_updated_at BEFORE UPDATE ON public.participations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.concours IS 'Stores contest information aggregated from various sources';
COMMENT ON TABLE public.participations IS 'Tracks user participation in contests';
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences for filtering and personalization';
COMMENT ON TABLE public.ingest_logs IS 'Logs for data ingestion jobs';
