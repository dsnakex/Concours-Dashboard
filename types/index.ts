// Types TypeScript pour Contest AI Platform

export type ParticipationType = 'direct' | 'reseaux_sociaux' | 'quiz' | 'creativ' | 'achat' | 'tirage';
export type LotCategory = 'voyage' | 'tech' | 'argent' | 'enfants' | 'autre';
export type ParticipationStatus = 'a_faire' | 'fait' | 'gagne' | 'perdu' | 'ignore';
export type ContestStatus = 'actif' | 'clos' | 'spam' | 'archived';

export interface Contest {
  id: string;
  titre: string;
  marque: string;
  description: string;
  lien_source: string;
  source: string;
  date_fin: string;
  date_ajout: string;
  date_updated: string;
  type_participation: ParticipationType;
  categorie_lot: LotCategory;
  temps_estime: number;
  valeur_estimee: number;
  nombre_lots: number;
  conditions_resumees: string;
  score_pertinence: number;
  raison_score: string;
  achat_obligatoire: boolean;
  pays_eligibles: string[];
  age_min?: number;
  statut: ContestStatus;
  clicks_count: number;
  comments_count: number;
  participation_status?: ParticipationStatus;
  created_at: string;
  updated_at: string;
}

export interface Participation {
  id: string;
  user_id: string;
  concours_id: string;
  statut: ParticipationStatus;
  date_participation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  contest?: Contest;
}

export interface UserSettings {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  types_participation_affichees: ParticipationType[];
  types_participation_masquees: ParticipationType[];
  categories_interessantes: LotCategory[];
  langue: 'fr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  total_participations: number;
  total_gagnes: number;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  search: string;
  types: ParticipationType[];
  categories: LotCategory[];
  hideReseauxSociaux: boolean;
  hideAchat: boolean;
  sortBy: 'score' | 'date_fin' | 'temps' | 'valeur';
}

export interface ContestScore {
  base_score: number;
  ia_adjustment: number;
  user_adjustment: number;
  final_score: number;
  reasoning: string;
  timestamp: Date;
}

export interface IAAnalysis {
  adjustment: number;
  explanation: string;
  scores?: {
    legitimacy: number;
    clarity: number;
    hidden_catches: number;
    true_value: number;
  };
}
