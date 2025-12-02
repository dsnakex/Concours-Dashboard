# 📋 Quick Reference Checklist for Claude Code Start

## 🎯 Your Mission (In 30 Seconds)

Build a **personal contest dashboard** that:
1. Shows French contests filtered by type (user can hide: réseaux sociaux, achats)
2. Scores each contest (IA = smart, not automated)
3. Lets you track participations (À faire → Participé → Gagné)
4. **100% Free** (Vercel + Supabase free tier + Ollama local)
5. **100% Safe** (user always in control, no bots)

---

## 📊 Document Cheat Sheet

| Document | When to Use | Key Sections |
|----------|------------|--------------|
| **00_README_CLAUDE_CODE.md** | Read FIRST (this is the overview) | TL;DR, Checklist, How to Use |
| **01_PROJECT_BRIEF.md** | Start coding (full scope) | Specs, Pages, DB Schema, Timeline |
| **02_API_SPEC.md** | Build endpoints (copy endpoints here) | All routes, Types, Responses |
| **03_IA_SCORING_ENGINE.md** | Scoring logic (copy functions) | Algorithm, LLM integration, Caching |
| **04_DATA_SOURCES_INGESTION.md** | Import contests (copy scrapers) | Sources, RSS parsing, Cron jobs |
| **05_TECHNICAL_SETUP.md** | Local setup (follow steps) | Supabase, Ollama, Next.js structure |
| **06_UI_UX_COMPONENTS.md** | Build UI (copy component code) | Design system, React components |

---

## 🛠️ Setup Checklist (Before Coding)

- [ ] Read **00_README_CLAUDE_CODE.md** (5 min)
- [ ] Skim **01_PROJECT_BRIEF.md** (10 min) - understand scope
- [ ] Follow **05_TECHNICAL_SETUP.md** (30 min):
  - [ ] Install Node 18+, pnpm
  - [ ] Create Supabase project
  - [ ] Create .env.local with credentials
  - [ ] Install Ollama + LLaMA 2
  - [ ] `pnpm install && pnpm dev` → localhost:3000 works

---

## 📝 Building Order (Week 1-3)

### Week 1: Database + Auth
1. **Database (01_PROJECT_BRIEF.md § Schema)**
   - Run Supabase migrations
   - Create tables: concours, participations, user_preferences
   - Setup RLS policies
   
2. **Auth (02_API_SPEC.md § Authentication)**
   - POST /api/auth/signup
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me
   
3. **Data Import**
   - Scrape ~100 contests from concoursetjeux.com + grandjeux.com
   - Create CSV or manual insert
   - Verify ~200 contests in DB

### Week 2: UI + Filtering
1. **Dashboard (06_UI_UX_COMPONENTS.md § 2.3)**
   - Page: /dashboard
   - Component: ContestCard (show all fields)
   - Component: FilterSidebar (type, hide socials/paid, sort, search)
   - Responsive grid layout
   
2. **Participations (06_UI_UX_COMPONENTS.md § 2.4)**
   - Page: /participations
   - Tabs: À faire, Participé, Gagné, Tous
   - Stats cards
   
3. **Settings (06_UI_UX_COMPONENTS.md § 2.5)**
   - Page: /settings
   - Update preferences, profile, theme

### Week 3: Scoring + Deploy
1. **Scoring (03_IA_SCORING_ENGINE.md)**
   - Implement calculateBaseScore() (rules)
   - Implement getIAAdjustment() (LLM)
   - Implement getUserPreferenceAdjustment()
   - Combine into calculateFinalScore()
   - Display score + reasoning on cards
   
2. **Polish**
   - Error handling
   - Loading states
   - Dark mode
   - Mobile responsive check
   
3. **Deploy (05_TECHNICAL_SETUP.md § 6)**
   - Push to GitHub
   - Connect Vercel
   - Set environment variables
   - Live URL ✅

---

## 🔑 Key Files to Create/Modify

```
contest-ai/
├── app/
│   ├── layout.tsx              ← Auth provider, Tailwind setup
│   ├── page.tsx                ← Redirect to /dashboard
│   ├── (auth)/
│   │   ├── login/page.tsx       ← Login form
│   │   └── signup/page.tsx      ← Signup form
│   ├── (app)/
│   │   ├── dashboard/page.tsx   ← MAIN PAGE (contests list)
│   │   ├── participations/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...auth].ts    ← Supabase auth handler
│       ├── concours/
│       │   ├── route.ts         ← GET /api/concours (list, filter, sort)
│       │   └── [id]/route.ts    ← GET /api/concours/:id
│       ├── participations/route.ts
│       ├── ia/
│       │   ├── score/route.ts   ← POST /api/ia/score
│       │   └── summarize/route.ts ← POST /api/ia/summarize
│       └── admin/
│           └── ingest/route.ts  ← POST /api/admin/ingest (manual trigger)
│
├── components/
│   ├── ContestCard.tsx
│   ├── FilterSidebar.tsx
│   ├── ParticipationRow.tsx
│   ├── StatCard.tsx
│   └── (common)
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── supabase.ts              ← Supabase client
│   ├── scoring.ts               ← Scoring functions (from 03_IA_SCORING_ENGINE.md)
│   ├── ollama.ts                ← LLM integration
│   └── types.ts                 ← TypeScript types (from 02_API_SPEC.md)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql ← DB schema (from 01_PROJECT_BRIEF.md)
│
├── .env.example
├── .env.local                  ← (gitignored)
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚡ Critical Code Patterns

### 1. API Routes (2-3 min per endpoint)
```typescript
// app/api/concours/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = Number(searchParams.get('skip')) || 0;
  const limit = Number(searchParams.get('limit')) || 20;
  
  const supabase = createServerComponentClient({ cookies });
  
  const { data, count, error } = await supabase
    .from('concours')
    .select('*', { count: 'exact' })
    .range(skip, skip + limit - 1)
    .order('score_pertinence', { ascending: false })
    .eq('statut', 'actif');
  
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  return Response.json({
    contests: data,
    total: count,
    hasMore: skip + limit < count
  });
}
```

### 2. React Component (3-5 min per component)
```typescript
// components/ContestCard.tsx
export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-lg transition">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{contest.titre}</h3>
          <p className="text-sm text-gray-600">{contest.marque}</p>
        </div>
        <span className="text-2xl">{PARTICIPATION_ICONS[contest.type_participation]}</span>
      </div>
      
      <div className="flex gap-2 mt-3">
        <span className="bg-blue-100 px-2 py-1 rounded text-sm">
          ⭐ {Math.round(contest.score_pertinence * 100)}%
        </span>
      </div>
      
      <p className="text-xs mt-2">{contest.conditions_resumees}</p>
      
      <a href={contest.lien_source} target="_blank" className="mt-3 btn btn-primary">
        Participer
      </a>
    </div>
  );
}
```

### 3. Scoring Function (already provided, just copy)
```typescript
// lib/scoring.ts (COPY from 03_IA_SCORING_ENGINE.md)
async function calculateFinalScore(
  contest: Contest,
  userSettings: UserSettings
): Promise<ContestScore> {
  const baseScore = calculateBaseScore(contest);           // Rules
  const iaAnalysis = await getIAAdjustment(contest);      // LLM
  const userAdjustment = getUserPreferenceAdjustment(contest, userSettings); // Prefs
  
  const rawScore = (baseScore * 0.5) + (iaAnalysis.adjustment * 0.3) + (userAdjustment * 0.2);
  
  return {
    final_score: Math.max(0, Math.min(100, rawScore)),
    reasoning: generateReasoning({ ... }),
    ...
  };
}
```

---

## 🚨 Common Pitfalls (Avoid These!)

1. ❌ **Using localStorage** → Use Supabase + RLS instead
2. ❌ **Forgetting RLS policies** → Data will leak between users
3. ❌ **Hardcoding API keys** → Use .env.local
4. ❌ **No error handling** → Users see blank screens on errors
5. ❌ **Not rate-limiting scraping** → Get IP banned
6. ❌ **Forgetting mobile responsive** → Breaks on phone
7. ❌ **Auto-submit without user click** → Illegal bot behavior
8. ❌ **No indexes on DB** → Dashboard will be slow

---

## ✅ Phase 1 Done When...

- [ ] Dashboard loads 100+ contests
- [ ] Can filter (hide socials, hide paid, by type, search)
- [ ] Can sort (score, date, time, value)
- [ ] Can mark participations (À faire → Participé → Gagné)
- [ ] Scoring calculates & displays (base + reasoning)
- [ ] Settings work (save preferences)
- [ ] Auth works (signup/login/logout)
- [ ] Mobile + desktop responsive
- [ ] Deployed on Vercel (live URL)
- [ ] No console errors

---

## 🎯 Quick Git Commands

```bash
# Start
git init
git add .
git commit -m "Initial commit"
git remote add origin <github-url>
git push -u origin main

# Keep pushing as you build
git add app/dashboard/page.tsx
git commit -m "Add dashboard page"
git push

# Deploy on Vercel
# (connect GitHub repo in Vercel dashboard)
```

---

## 📞 If Stuck...

| Problem | Solution | Document |
|---------|----------|----------|
| "How do I setup DB?" | Follow § 2 in TECHNICAL_SETUP | 05_TECHNICAL_SETUP.md |
| "What's my API?" | Copy endpoints from spec | 02_API_SPEC.md |
| "Scoring not working?" | Copy functions from engine | 03_IA_SCORING_ENGINE.md |
| "How do I import contests?" | Follow data ingestion guide | 04_DATA_SOURCES_INGESTION.md |
| "Component template?" | Copy from specs | 06_UI_UX_COMPONENTS.md |
| "What should I build first?" | Follow "Building Order" ☝️ | This doc |

---

## 🎉 Ready to Launch?

1. Read this file (5 min)
2. Read 01_PROJECT_BRIEF.md (10 min)
3. Follow TECHNICAL_SETUP.md (30 min local setup)
4. Start Week 1: Database + Auth
5. Follow building order above
6. Deploy to Vercel after Week 3

**You got this! 🚀**

Questions? Everything is documented in the 7 files provided.

Go build something awesome! 💪
