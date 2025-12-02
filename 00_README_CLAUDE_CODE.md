# 🎯 Contest AI Platform - Complete Developer Brief for Claude Code

**Bonjour Claude!** Voici ta mission: créer une plateforme personnelle d'agrégation de jeux-concours avec scoring IA.

---

## 📋 TL;DR (The Ask)

### What
Build a **personal dashboard web app** that:
- Aggregates French contest data (5-10 sources)
- Filters by participation type (you can toggle: hide social media, hide paid)
- Scores contests using hybrid algorithm (rules + LLM)
- Tracks your participation history
- **100% Safe:** Assistance only, no automation (user always in control)

### Tech Stack (100% FREE)
- **Frontend:** Next.js 14, React, Tailwind CSS → Deploy Vercel Free
- **Database:** Supabase PostgreSQL Free (500MB)
- **IA:** Ollama local (LLaMA 2 7B) or Claude API
- **Auth:** Supabase Auth (email/password)

### Timeline
- **Phase 1 (3 weeks):** MVP Dashboard + Basic Scoring
- **Phase 2 (future):** Extension + Advanced IA

### Success = Core Dashboard Working with 100+ contests, filterable, scored, and tracked

---

## 📚 Complete Specifications Provided

6 detailed documents created for you:

1. **01_PROJECT_BRIEF.md** ← START HERE
   - Full project scope
   - Pages & features
   - Database schema
   - Success criteria

2. **02_API_SPEC.md**
   - All REST endpoints
   - Request/response formats
   - TypeScript types
   - Rate limiting

3. **03_IA_SCORING_ENGINE.md**
   - Hybrid scoring algorithm (rules + LLM)
   - Base score calculation (value, effort, mechanics, popularity)
   - IA adjustment via LLM
   - User preferences personalization
   - Conditions summarization
   - Caching strategy

4. **04_DATA_SOURCES_INGESTION.md**
   - Reliable French contest sources
   - Scraping strategy (ethical, robots.txt compliant)
   - RSS parsing code
   - HTML scraping fallback
   - Cron job scheduling
   - CSV import for MVP

5. **05_TECHNICAL_SETUP.md**
   - Step-by-step environment setup
   - Supabase database creation
   - Ollama local IA setup
   - Next.js project structure
   - Development workflow
   - Deployment to Vercel
   - Troubleshooting

6. **06_UI_UX_COMPONENTS.md**
   - Design system (colors, typography, spacing)
   - React component specs with code examples
   - Responsive design breakpoints
   - Loading states
   - Accessibility checklist
   - Dark mode support

---

## 🎨 Key Features to Build

### Dashboard Page (`/dashboard`)
```
┌─────────────────────────────────────┐
│ My Contests (100 contests matching) │
├─────────┬───────────────────────────┤
│ FILTERS │                           │
│         │  [Contest Card] ×20       │
│ ▼ Hide  │  - Title + Brand          │
│ Socials │  - Icon + Score ⭐85%     │
│ ▼ Hide  │  - Time + Value badges    │
│ Paid    │  - Conditions summary     │
│         │  - Buttons: Participate, │
│ Sort ▼  │    Mark done, etc         │
│ By      │                           │
│ Score   │  [Load more...]           │
│         │                           │
└─────────┴───────────────────────────┘
```

### Participations Page (`/participations`)
- Tabs: À faire, Participé, Gagné, Tous
- Stats cards (total, count by status)
- List with status badges, dates, links

### Settings Page (`/settings`)
- Profile: name, phone
- Preferences: types to hide, favorite categories
- Display: language, theme
- Danger: export data, delete account

---

## 🧠 Scoring Algorithm (Simple but Smart)

```
Final Score = (BaseScore × 0.5) + (IAAdjustment × 0.3) + (UserAdjustment × 0.2)
            = 0 to 100 (displayed as %)

BaseScore (0-50):
  - Value: +1-10 based on lot value
  - Effort: +1-10 inverted (quick = high)
  - Mechanics: +0-15 (tirage=15, direct=12, quiz=8, creativ=5)
  - Popularity: +0-15 (clicks/engagement)
  - Legitimacy: +0-10 (spam detection)

IAAdjustment (-30 to +30): LLM analyzes description
  - Legitimacy & trustworthiness
  - Hidden catches or complexity
  - True value estimate
  - Returns JSON with adjustment + reasoning

UserAdjustment (-20 to +20): Personalization
  - Matches user interests: +10
  - Matches preferred types: +5
  - User masked this type: -20 (strong penalty)
  - Bonus for quick/time-constrained users: +5
```

**→ Result:** User sees "⭐ 85% - Lot tech intéressant (2000€) + Tirage simple + Gratuit"

---

## 🗄️ Database Schema (Key Tables)

### concours
```
id (UUID)
titre, marque, description, lien_source (UNIQUE)
date_fin, date_ajout, date_updated
type_participation (direct|reseaux_sociaux|quiz|creativ|achat|tirage)
categorie_lot (voyage|tech|argent|enfants|autre)
temps_estime (int, minutes)
valeur_estimee (int, euros)
nombre_lots (int)
conditions_resumees (text)
achat_obligatoire (boolean)
pays_eligibles (string[])
age_min (int)
score_pertinence (float 0-1)
raison_score (text)
statut (actif|clos|spam|archived)
clicks_count, comments_count (for popularity)
created_at, updated_at
```

### participations
```
id (UUID)
user_id (FK → auth.users)
concours_id (FK → concours)
statut (a_faire|fait|gagne|perdu|ignore)
date_participation (timestamp)
notes (text)
created_at, updated_at
UNIQUE(user_id, concours_id)
```

### user_preferences (extends Supabase auth)
```
id (UUID, refs auth.users)
name, phone
types_participation_affichees/masquees (string[])
categories_interessantes (string[])
langue (fr|en)
theme (light|dark|auto)
total_participations, total_gagnes (int)
created_at, updated_at
```

---

## 🚀 Phase 1 Implementation Roadmap

### Week 1: Setup + Data
- [ ] Create Next.js 14 project + Supabase
- [ ] Setup Supabase PostgreSQL + migrations
- [ ] Setup Ollama (or test Claude API)
- [ ] Create database schema
- [ ] Implement auth (signup/login)
- [ ] Scrape/import 100-200 contests (CSV approach for MVP)

### Week 2: Core UI + Filters
- [ ] Dashboard page layout
- [ ] Contest card component
- [ ] Filter sidebar (collapsible mobile)
- [ ] Search + sort functionality
- [ ] Participations history page
- [ ] Settings page
- [ ] Responsive design (mobile-first)

### Week 3: IA + Scoring
- [ ] Integrate Ollama/Claude API
- [ ] Base score calculation (rules)
- [ ] IA adjustment (LLM summarization)
- [ ] User preferences personalization
- [ ] Score display + reasoning
- [ ] Caching strategy
- [ ] Deploy to Vercel
- [ ] Test full flow end-to-end

---

## 🔐 Key Constraints & Guardrails

### 100% Safe (NO Automation)
- ✅ User always initiates actions
- ✅ No auto-submit (only assistance)
- ✅ Pre-fill fields OK (but user sees & can edit)
- ✅ Suggestions OK (quiz answers, etc.)
- ❌ NO bots, NO headless browser, NO multi-account

### Legal Compliance
- ✅ Respect robots.txt
- ✅ Rate limiting (1 req/2 sec per source)
- ✅ Link back to original sources
- ✅ Proper User-Agent identification
- ✅ RGPD: User data private, local to Supabase

### Privacy & Data
- ✅ No tracking beyond what user opts in
- ✅ All participations belong to user
- ✅ User can export/delete data (RGPD)
- ✅ No data sharing (single-user tool)

---

## 📦 Deliverables for Phase 1

### Code
- ✅ Next.js app (GitHub-ready)
- ✅ TypeScript throughout
- ✅ API routes (all endpoints from spec)
- ✅ React components (functional, with hooks)
- ✅ Database migrations
- ✅ Environment setup (.env.example)

### Data
- ✅ ~100-200 contests in DB (CSV import)
- ✅ Ingestion pipeline skeleton (ready for automation Week 2)

### Docs
- ✅ README (setup instructions)
- ✅ Deployment guide (Vercel)
- ✅ Troubleshooting

### Tests (Optional for MVP)
- ✅ Auth flow working
- ✅ Dashboard loads without errors
- ✅ Filters work correctly
- ✅ Scoring calculates (both base + IA)
- ✅ Participations track
- ✅ Mobile responsive

---

## 🛠️ How to Use This Brief

### For Claude Code:
1. **Start with 01_PROJECT_BRIEF.md** → Understand scope, pages, DB schema
2. **Reference 02_API_SPEC.md** → Implement endpoints (copy-paste types)
3. **Copy code from 03_IA_SCORING_ENGINE.md** → Integrate scoring logic
4. **Use 04_DATA_SOURCES_INGESTION.md** → Setup data pipeline
5. **Follow 05_TECHNICAL_SETUP.md** → Local dev + deployment
6. **Copy component specs from 06_UI_UX_COMPONENTS.md** → Build UI

### For Developer (YOU):
1. Setup local environment (Node, Supabase, Ollama) per 05_TECHNICAL_SETUP.md
2. Create .env.local with credentials
3. Run `pnpm install && pnpm dev`
4. Test dashboard loads
5. Import contest CSV
6. Test scoring + filtering
7. Deploy to Vercel

---

## ✅ Success Criteria (How to Know It's Done)

Phase 1 = ✅ if:
- [ ] Dashboard loads without errors
- [ ] Shows 100+ contests (from CSV import)
- [ ] Filters work: can hide socials, hide paid, filter by type
- [ ] Search works (title + brand)
- [ ] Sort works (score, date, time, value)
- [ ] Can mark contests as "À faire", "Participé", "Gagné"
- [ ] Participations page shows history
- [ ] Settings page works (save preferences)
- [ ] Scoring calculates & displays (base + reasoning)
- [ ] Responsive on mobile + desktop
- [ ] Auth (signup/login/logout) works
- [ ] Deployed on Vercel (live URL)

---

## 🎯 What NOT to Do

- ❌ Don't build automation (user must always click)
- ❌ Don't use aggressive scraping (respect robots.txt)
- ❌ Don't skip database indexes (will be slow)
- ❌ Don't forget RLS (row-level security) on Supabase
- ❌ Don't use localStorage (breaks in sandbox) → use Supabase
- ❌ Don't forget mobile responsiveness
- ❌ Don't hardcode API keys (use .env)
- ❌ Don't skip error handling (show user-friendly messages)

---

## 📞 Questions? Reference Docs

All answers in the 6 documents:
- "How do I score contests?" → 03_IA_SCORING_ENGINE.md
- "What's the database schema?" → 01_PROJECT_BRIEF.md (§2.1)
- "How do I setup Supabase?" → 05_TECHNICAL_SETUP.md (§2)
- "What API endpoints?" → 02_API_SPEC.md
- "How do I deploy?" → 05_TECHNICAL_SETUP.md (§6)
- "What components?" → 06_UI_UX_COMPONENTS.md

---

## 🚀 Ready to Start?

Tell Claude Code:

```
I'm building a personal contest aggregation dashboard (Contest AI Platform).

Here's your mission:
1. Create Next.js 14 project (TypeScript)
2. Setup Supabase PostgreSQL database + auth
3. Implement dashboard with contests list, filters (hide socials/paid), sorting
4. Build scoring engine (hybrid: rules + Ollama LLM)
5. Track participations (À faire → Participé → Gagné)
6. Make it responsive + deploy to Vercel

Reference documents provided:
- 01_PROJECT_BRIEF.md (scope, features, schema)
- 02_API_SPEC.md (all endpoints)
- 03_IA_SCORING_ENGINE.md (scoring logic)
- 04_DATA_SOURCES_INGESTION.md (data pipeline)
- 05_TECHNICAL_SETUP.md (setup guide)
- 06_UI_UX_COMPONENTS.md (UI specs)

Start with: Database schema → Auth → Dashboard UI → Scoring → Deploy

Constraints:
- 100% safe (no automation, user always in control)
- Free stack only (Vercel, Supabase free, Ollama local)
- 3-week timeline for Phase 1
- TypeScript throughout
```

---

**Good luck! 🎉 You've got this!**

Questions? Reference the docs. Everything is documented.
