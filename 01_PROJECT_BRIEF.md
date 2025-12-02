# Contest AI Platform - Project Brief

## 1. Contexte & Objectifs

### Qui
- **Developer:** Biotech researcher + Full-stack dev (France)
- **Usage:** Personal tool pour optimiser participations aux jeux-concours
- **Timeline:** 3 semaines MVP (Phase 1)

### Quoi
Créer un **dashboard personnel** (web app) qui:
1. Agrège jeux-concours de sources fiables
2. Classe concours par type de participation (filtrable)
3. Score pertinence basé sur préférences + IA
4. Affiche conditions clés (résumées par IA)
5. Permet tracker participations (À faire → Participé → Gagné)

### Pourquoi
- Économiser 5-10h/semaine (centralisation + filtrage intelligent)
- Augmenter taux gain concours (priorité par score IA)
- 100% légal & safe (assistance, pas automation)

---

## 2. Spécifications Fonctionnelles

### 2.1 Pages Principales

#### Dashboard (Page d'Accueil)
```
GET /dashboard

Affiche:
- Liste concours filtrés (par défaut: triés par score décroissant)
- Chaque concours affiche:
  - Titre + Marque
  - Icon type participation (🌐 direct, 👥 réseaux sociaux, ❓ quiz, 🎨 créatif, 💳 achat, 🎲 tirage)
  - Score pertinence (0-100%)
  - Temps estimé + Valeur estimée du lot
  - Conditions résumées (1-2 lignes clés)
  - Boutons: "Participer" (lien externe), "À faire", "✅ Participé", "❌ Ignorer"
- Filtre sidebar (collapsible mobile):
  - Masquer réseaux sociaux (checkbox)
  - Masquer achats obligatoires (checkbox)
  - Filtrer par type participation (multi-select)
  - Filtrer par catégorie lot (multi-select: voyage, tech, argent, enfants, etc.)
  - Tri: Score ↓, Date fin ↓, Temps estimé ↑, Valeur ↓
  - Recherche texte (titre, marque)
```

#### Participations (History)
```
GET /participations

Affiche:
- Onglets: À faire, Participé, Gagné, Tous
- List participations avec:
  - Concours title + marque
  - Status badge (À faire, Participé, Gagné, Perdu?)
  - Date participation
  - Notes utilisateur (ex: "À compléter avant 18h")
  - Lien direct site (si applicable)
- Stats perso (card summary):
  - "Vous avez participé à X concours ce mois"
  - "Temps investi: ~Xh"
  - "Gains estimés: X€" (if won)
```

#### Settings
```
GET /settings

Permet:
- Gérer données perso (email, name, phone - pour pré-fill futur extension)
- Choix types participation à afficher (checkboxes)
- Choix catégories lots intéressants
- Language (FR/EN)
- Export données (future)
- Delete account (RGPD)
```

#### Admin Panel (perso usage)
```
GET /admin (protected)

Affiche:
- DB stats: nombre concours, dernière ingestion, sources status
- Manual import: upload CSV concours
- Trigger: scrape sources maintenant
- Logs: dernières actions système
```

---

## 3. Modèle de Données

### Concours Table
```sql
CREATE TABLE concours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Métadonnées principales
  titre VARCHAR NOT NULL,
  marque VARCHAR,
  description TEXT,
  lien_source VARCHAR UNIQUE NOT NULL,
  source VARCHAR, -- 'concoursetjeux.com', 'grandjeux.fr', 'manual', etc.
  
  -- Dates critiques
  date_fin TIMESTAMP NOT NULL,
  date_ajout TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  
  -- Classification User
  type_participation VARCHAR NOT NULL, 
    -- 'direct', 'reseaux_sociaux', 'quiz', 'creativ', 'achat', 'tirage'
  categorie_lot VARCHAR,
    -- 'voyage', 'tech', 'argent', 'enfants', 'autre'
  
  -- Effort & Value
  temps_estime INT DEFAULT 0, -- minutes
  valeur_estimee INT DEFAULT 0, -- euros
  nombre_lots INT DEFAULT 1,
  
  -- Conditions résumées
  conditions_resumees TEXT, -- "Gratuit, pas achat, France 18+, Follow Instagram requis"
  achat_obligatoire BOOLEAN DEFAULT FALSE,
  pays_eligibles VARCHAR[] DEFAULT ARRAY['FR'],
  age_min INT,
  
  -- IA Scoring
  score_pertinence FLOAT DEFAULT 0, -- 0.0 à 1.0
  raison_score TEXT, -- "Score élevé: lot tech (2000€) + tirage simple + gratuit"
  
  -- Status
  statut VARCHAR DEFAULT 'actif', 
    -- 'actif', 'clos', 'spam', 'archived'
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_concours_date_fin ON concours(date_fin DESC);
CREATE INDEX idx_concours_type ON concours(type_participation);
CREATE INDEX idx_concours_categorie ON concours(categorie_lot);
CREATE INDEX idx_concours_statut ON concours(statut);
CREATE INDEX idx_concours_score ON concours(score_pertinence DESC);
```

### Participations Table
```sql
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concours_id UUID NOT NULL REFERENCES concours(id),
  
  -- Status
  statut VARCHAR DEFAULT 'a_faire', 
    -- 'a_faire', 'fait', 'gagne', 'perdu', 'ignore'
  
  -- Tracking
  date_participation TIMESTAMP,
  notes TEXT, -- Notes utilisateur (ex: "À compléter avant 18h")
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique: 1 participation par concours
  UNIQUE(concours_id)
);

-- Indexes
CREATE INDEX idx_participations_statut ON participations(statut);
CREATE INDEX idx_participations_date ON participations(date_participation DESC);
CREATE INDEX idx_participations_concours ON participations(concours_id);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth (Supabase gérera via auth)
  email VARCHAR UNIQUE NOT NULL,
  
  -- Profil
  name VARCHAR,
  phone VARCHAR,
  
  -- Préférences affichage
  types_participation_affichees VARCHAR[] 
    DEFAULT ARRAY['direct', 'quiz', 'tirage'],
  types_participation_masquees VARCHAR[] 
    DEFAULT ARRAY['reseaux_sociaux', 'achat'],
  categories_interessantes VARCHAR[],
  
  -- Préférences IA/Auto
  langue VARCHAR DEFAULT 'fr', -- 'fr', 'en'
  theme VARCHAR DEFAULT 'light', -- 'light', 'dark', 'auto'
  
  -- Stats
  total_participations INT DEFAULT 0,
  total_gagnes INT DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Architecture Technique

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React + Tailwind CSS
- **State:** React Query (server state) + Zustand (client state - optionnel)
- **Deploy:** Vercel Free

### Backend
- **Runtime:** Node.js (Vercel Edge Functions ou Supabase Edge Functions)
- **Database:** Supabase PostgreSQL (Free tier)
- **Auth:** Supabase Auth (email/password)

### IA & Scoring
- **Model:** Ollama Local (LLaMA 2 7B) OU Claude API (~20€/mois)
- **Scoring:** Hybrid (règles + LLM légér)

### Data Ingestion
- **Sources:** 5-10 sources fiables (à définir)
- **Method:** RSS scraping + manual imports
- **Schedule:** Cron job toutes les 12h
- **Dedup:** Basé sur lien_source (unique constraint)

---

## 5. Stack Complet (0€)

```
Frontend:        Next.js 14 + Vercel Free .................. 0€
Database:        Supabase Free (500MB) ..................... 0€
IA Local:        Ollama (LLaMA 2 7B) self-hosted ........... 0€
Domain:          .local ou ngrok gratuit ................... 0€
────────────────────────────────────────────────────────────
TOTAL COST:      0€ (si self-host IA) ou 20€/mois (Claude API)
```

---

## 6. Roadmap Phase 1 (3 semaines)

### Semaine 1: Setup + Data Ingestion
- [ ] Repo Next.js + Supabase setup
- [ ] Schema DB create + migrations
- [ ] Script data: Collect 5-10 sources concours fiables
- [ ] Data pipeline: Scrape → Déduplicate → Insert Supabase
- [ ] Import 100-200 concours manuellement ou automatic

### Semaine 2: Core UI
- [ ] Dashboard page + list concours
- [ ] Filtres: type participation, masquer réseaux sociaux/achat
- [ ] Marquer: À faire / Participé / Gagné
- [ ] Search texte + sort
- [ ] Responsive design (mobile-first)

### Semaine 3: IA + Scoring
- [ ] Intègre Ollama (ou Claude API test)
- [ ] Scoring algorithme (règles + LLM)
- [ ] Résumés conditions IA
- [ ] Deploy Vercel
- [ ] Test intégration complet

---

## 7. Contraintes & Limites

- ✅ **100% Safe:** Zéro automation, assistance purement informationnelle
- ✅ **Personal Tool:** Pas de dimension commerciale, pas de public API
- ✅ **Privacy:** Aucune donnée partagée, tout local ou Supabase perso
- ✅ **Legal:** Respects CGU sites concours (liens directs, pas scraping abusif)

---

## 8. Success Criteria (Phase 1)

- ✅ Dashboard affiche 100+ concours sans lag
- ✅ Filtres fonctionnent correctement
- ✅ IA scoring génère en <2sec
- ✅ Conditions résumées utilité (max 2 lignes, infos critiques)
- ✅ UI responsive (mobile + desktop)
- ✅ Deploy live (Vercel + Supabase)

---

## Next Steps

1. Identifier 5-10 sources concours fiables (RDV séparé)
2. Setup repo + Supabase
3. Build Phase 1 avec Claude Code
4. Iterate basé feedback personnel
