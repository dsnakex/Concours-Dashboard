# 📚 Complete Documentation Index

## 📦 What You Have (8 Complete Documents)

All files are ready to hand off to Claude Code. Each document is self-contained but cross-referenced.

---

## 📋 Files Overview

### 1. **QUICK_START_CHECKLIST.md** ← Start Here (5 min)
**For:** First-time reading + orientation
- 30-second mission summary
- Document cheat sheet (which file for what)
- Week-by-week building plan
- Common pitfalls to avoid
- Quick reference table

### 2. **00_README_CLAUDE_CODE.md** ← Second (10 min)
**For:** Claude Code orientation + developer brief
- TL;DR (project scope in bullets)
- Tech stack overview (all free!)
- Key features breakdown
- Scoring algorithm explained
- Database schema summary
- Phase 1 roadmap (3 weeks)
- What NOT to do (critical guardrails)
- Deliverables checklist
- Success criteria

### 3. **01_PROJECT_BRIEF.md** ← Start Coding Here
**For:** Full project specifications + building reference
- Context & objectives (who/what/why)
- Spécifications fonctionnelles (all pages):
  - Dashboard (main feature)
  - Participations (history)
  - Settings (preferences)
  - Admin panel (basic)
- Complete database model:
  - concours table (full schema with types)
  - participations table
  - users table
  - All indexes defined
- Architecture overview
- 3-week roadmap breakdown
- Constraints & compliance

### 4. **02_API_SPEC.md** ← Reference While Coding
**For:** All REST API endpoints + TypeScript types
- Authentication routes (signup/login/logout/me)
- Concours routes (GET/POST/filtering/sorting)
- Participations routes (history, update status)
- IA routes (scoring, summarization)
- Settings/Admin routes
- Error handling patterns
- Rate limiting strategy
- Pagination standard
- Complete TypeScript types (copy-paste ready)

### 5. **03_IA_SCORING_ENGINE.md** ← Copy Scoring Logic
**For:** Hybrid AI scoring implementation
- Algorithm overview (formula + components)
- Base score calculation (rules-based):
  - Value scoring (0-10 points)
  - Effort scoring (0-10 points, inverted)
  - Mechanics bonus (0-15 points)
  - Popularity scoring (0-15 points)
  - Legitimacy detection (0-10 points)
- IA adjustment (LLM integration):
  - When to use LLM
  - Exact prompt template
  - JSON response format
  - Error handling fallback
- User preferences personalization (-20 to +20 adjustment)
- Final score calculation (weighted formula)
- Reasoning generation (user-friendly explanations)
- Conditions summarization (LLM):
  - Prompt template
  - Response format
- Caching strategy (24h invalidation)
- Batch scoring (for dashboard optimization)
- Monitoring metrics
- Configuration constants (tunable params)

### 6. **04_DATA_SOURCES_INGESTION.md** ← Data Pipeline Reference
**For:** Contest data sourcing + ETL
- Tier 1 sources (high quality):
  - ConcoursetJeux.com (RSS + scraping)
  - GrandJeuxConcours.fr (HTML)
  - JeuxConcours.fr (RSS)
  - ConcoursDirect.com
- Tier 2 sources (brand websites, manual)
- Tier 3 sources (communities, manual)
- Scraping architecture:
  - EthicalOK (robots.txt compliant, rate-limited)
  - Full TypeScript code for ingestion pipeline
  - Dupe detection logic
- RSS parsing code (ready to copy)
- HTML scraping code (fallback)
- Helper functions:
  - Detect participation type
  - Estimate time/value
  - Detect purchase requirement
- Cron job schedule (2x/day)
- Manual trigger API
- Data quality validation
- CSV import for MVP
- Initial data load strategy

### 7. **05_TECHNICAL_SETUP.md** ← Local Dev + Deployment
**For:** Step-by-step setup instructions
- Prerequisites (Node 18+, pnpm, git)
- Clone & setup repo
- Environment variables (.env.local)
- Supabase setup:
  - Project creation (Europe region)
  - Credentials extraction
  - Database table creation
  - Migration files (complete SQL)
  - RLS (Row-Level Security) policies
- Ollama setup (local IA):
  - Installation (macOS/Linux/Windows)
  - Download LLaMA 2 7B
  - Start server (localhost:11434)
  - API integration code
- Next.js project structure (full folder tree)
- Development workflow:
  - Starting dev server
  - Database changes during dev
  - Testing strategy
- Deployment to production:
  - Vercel setup (GitHub → Vercel → Live)
  - Optional Node backend (Railway/Render)
  - Database backup strategy
- Monitoring & debugging:
  - Logs access
  - Performance checks
  - Error tracking (Sentry optional)
- Quick start checklist
- Troubleshooting guide

### 8. **06_UI_UX_COMPONENTS.md** ← Component Templates
**For:** React component specs + design system
- Design system:
  - Color palette (primary/secondary/danger/success/warning)
  - Typography (font families, sizes)
  - Spacing scale (4px, 8px, 12px, ...)
  - Border radius system
  - Shadow system
- Key components with full React code:
  - ContestCard (main component)
  - FilterSidebar (search, filters, sort)
  - Dashboard main layout (grid)
  - ParticipationsPage (tabs, history)
  - SettingsPage (form)
- Responsive design breakpoints (mobile/tablet/desktop)
- Loading states & skeletons
- Accessibility checklist (WCAG 2.1 AA)
- Dark mode support
- Animation & transitions
- Component stubs ready for implementation

---

## 🎯 How to Use These Documents

### For Claude Code (AI Assistant)

**Option 1: Sequential Learning**
```
1. Read 00_README_CLAUDE_CODE.md (orientation)
2. Skim 01_PROJECT_BRIEF.md (understand scope)
3. Copy patterns from 02_API_SPEC.md (endpoints)
4. Copy code from 03_IA_SCORING_ENGINE.md (scoring)
5. Copy scrapers from 04_DATA_SOURCES_INGESTION.md (data)
6. Follow 05_TECHNICAL_SETUP.md (setup)
7. Copy components from 06_UI_UX_COMPONENTS.md (UI)
```

**Option 2: Task-Driven (Recommended)
```
Task: "Build database schema"
→ Reference: 01_PROJECT_BRIEF.md § 3 (schema)
→ Follow: 05_TECHNICAL_SETUP.md § 2.3 (migrations)

Task: "Create API endpoints"
→ Reference: 02_API_SPEC.md (all endpoints)
→ Copy: Full TypeScript types

Task: "Implement scoring"
→ Reference: 03_IA_SCORING_ENGINE.md (algorithm)
→ Copy: All functions (plug & play)

Task: "Import contest data"
→ Reference: 04_DATA_SOURCES_INGESTION.md (pipeline)
→ Copy: Scraping + ingestion code

Task: "Build dashboard UI"
→ Reference: 06_UI_UX_COMPONENTS.md (components)
→ Copy: React component code

Task: "Deploy to production"
→ Follow: 05_TECHNICAL_SETUP.md § 6 (Vercel)
```

### For You (Developer)

**Before Starting**
1. Read QUICK_START_CHECKLIST.md (orientation)
2. Follow 05_TECHNICAL_SETUP.md (setup)
3. Bookmark all 8 files (reference often)

**During Development**
- Phase 1 (Week 1): Use 01_PROJECT_BRIEF.md § schema + 05_TECHNICAL_SETUP
- Phase 1 (Week 2): Use 06_UI_UX_COMPONENTS.md + 02_API_SPEC.md
- Phase 1 (Week 3): Use 03_IA_SCORING_ENGINE.md + 04_DATA_SOURCES_INGESTION.md

**Deployment**
- Use 05_TECHNICAL_SETUP.md § 6

---

## ✅ Document Quality Checklist

Each document includes:
- ✅ Complete, copy-paste-ready code examples
- ✅ Clear sections with headers
- ✅ TypeScript types (when applicable)
- ✅ Error handling patterns
- ✅ Links to related documents
- ✅ Practical examples & scenarios
- ✅ Troubleshooting sections
- ✅ No placeholders or TODOs (production-ready)

---

## 📊 Content Matrix (Which Document Has What)

| Content | Document | Section |
|---------|----------|---------|
| Project scope | 01_PROJECT_BRIEF.md | § 1 |
| Database schema | 01_PROJECT_BRIEF.md | § 3 |
| API endpoints | 02_API_SPEC.md | Entire |
| Scoring algorithm | 03_IA_SCORING_ENGINE.md | § 1-5 |
| Scoring code (copy) | 03_IA_SCORING_ENGINE.md | § 2-6 |
| Data sources | 04_DATA_SOURCES_INGESTION.md | § 1 |
| Scraping code (copy) | 04_DATA_SOURCES_INGESTION.md | § 2.2-2.4 |
| Local setup | 05_TECHNICAL_SETUP.md | § 1-3 |
| Deployment | 05_TECHNICAL_SETUP.md | § 6 |
| UI components (copy) | 06_UI_UX_COMPONENTS.md | § 2 |
| Design system | 06_UI_UX_COMPONENTS.md | § 1 |
| Week-by-week plan | 00_README_CLAUDE_CODE.md | Roadmap |
| Quick checklist | QUICK_START_CHECKLIST.md | Building order |

---

## 🚀 Handing Off to Claude Code

### What to Say:

```
Here's my contest aggregation project brief.

I've prepared 8 complete documents:
1. QUICK_START_CHECKLIST.md (read first)
2. 00_README_CLAUDE_CODE.md (orientation)
3. 01_PROJECT_BRIEF.md (full scope)
4. 02_API_SPEC.md (all endpoints)
5. 03_IA_SCORING_ENGINE.md (scoring logic)
6. 04_DATA_SOURCES_INGESTION.md (data pipeline)
7. 05_TECHNICAL_SETUP.md (technical setup)
8. 06_UI_UX_COMPONENTS.md (UI specs)

Mission:
- Build Next.js 14 personal contest dashboard
- Filters by type (can hide socials, paid)
- Scores with hybrid IA (rules + Ollama LLM)
- Tracks participations
- 100% Free stack (Vercel + Supabase + Ollama)
- 100% Safe (no automation, user always in control)

Start with: Database schema → Auth → Dashboard UI → Scoring → Deploy

Timeline: 3 weeks Phase 1 (MVP)

All code examples, types, and functions are in the documents.
Reference them while building.
```

---

## 📞 Quick Reference (What to Look Up)

| Question | Answer In |
|----------|-----------|
| "What should I build?" | QUICK_START_CHECKLIST.md § Building Order |
| "What's the database schema?" | 01_PROJECT_BRIEF.md § 3 |
| "Give me all API endpoints" | 02_API_SPEC.md (entire) |
| "How does scoring work?" | 03_IA_SCORING_ENGINE.md § 1 |
| "Give me scoring functions" | 03_IA_SCORING_ENGINE.md § 2-6 |
| "Where do I get contest data?" | 04_DATA_SOURCES_INGESTION.md § 1 |
| "Give me scraping code" | 04_DATA_SOURCES_INGESTION.md § 2 |
| "How do I setup locally?" | 05_TECHNICAL_SETUP.md § 1-3 |
| "How do I deploy?" | 05_TECHNICAL_SETUP.md § 6 |
| "Give me UI components" | 06_UI_UX_COMPONENTS.md § 2 |
| "I'm stuck on X" | 05_TECHNICAL_SETUP.md § 9 (Troubleshooting) |

---

## 🎉 You're Ready!

All specifications, code, and instructions are here. No guessing, no back-and-forth.

**Ready to build? 🚀**

Refer back to these documents as needed. Everything is documented.
