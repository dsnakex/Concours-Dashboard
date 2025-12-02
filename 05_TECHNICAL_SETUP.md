# Technical Setup & Deployment Guide

## 1. Local Development Environment Setup

### 1.1 Prerequisites
```bash
# Node.js 18+ (LTS recommended)
node --version  # v18.x or v20.x

# pnpm (faster than npm)
npm install -g pnpm
pnpm --version

# Git
git --version

# (Optional) Docker for Ollama
# Download from https://www.docker.com/products/docker-desktop
```

### 1.2 Clone & Setup Repo

```bash
# Clone starter template (to be created)
git clone <repo-url> contest-ai
cd contest-ai

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
```

### 1.3 Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# IA Model
IA_MODEL=ollama  # 'ollama' or 'claude'
OLLAMA_API_URL=http://localhost:11434
# OR if using Claude:
OPENAI_API_KEY=sk-...  # Claude API key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVIRONMENT=development

# Admin (for triggers)
ADMIN_SECRET=your-admin-secret-key
```

---

## 2. Supabase Setup (Database)

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Choose region: Europe (nearest to France)
5. Wait for setup (~2-5 min)

### 2.2 Get Credentials

In Supabase dashboard:
- Settings → API
  - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 Create Database Tables

Run migrations:

```bash
# Using Supabase CLI (recommended)
pnpm supabase link --project-ref your-project-id
pnpm supabase push

# Or manually: Go to Supabase dashboard → SQL Editor
# Paste migrations from /supabase/migrations/
```

### 2.3 Migration Files

Create `/supabase/migrations/001_initial_schema.sql`:

```sql
-- Users table (managed by Supabase Auth)
-- Already created by Supabase Auth, we just extend it

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR,
  phone VARCHAR,
  types_participation_affichees VARCHAR[] DEFAULT ARRAY['direct', 'quiz', 'tirage'],
  types_participation_masquees VARCHAR[] DEFAULT ARRAY['reseaux_sociaux', 'achat'],
  categories_interessantes VARCHAR[],
  langue VARCHAR DEFAULT 'fr',
  theme VARCHAR DEFAULT 'light',
  total_participations INT DEFAULT 0,
  total_gagnes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Concours table
CREATE TABLE public.concours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR NOT NULL,
  marque VARCHAR,
  description TEXT,
  lien_source VARCHAR UNIQUE NOT NULL,
  source VARCHAR DEFAULT 'manual',
  
  date_fin TIMESTAMP NOT NULL,
  date_ajout TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  
  type_participation VARCHAR NOT NULL,
  categorie_lot VARCHAR,
  
  temps_estime INT DEFAULT 0,
  valeur_estimee INT DEFAULT 0,
  nombre_lots INT DEFAULT 1,
  
  conditions_resumees TEXT,
  achat_obligatoire BOOLEAN DEFAULT FALSE,
  pays_eligibles VARCHAR[] DEFAULT ARRAY['FR'],
  age_min INT,
  
  score_pertinence FLOAT DEFAULT 0,
  raison_score TEXT,
  
  statut VARCHAR DEFAULT 'actif',
  clicks_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Participations table
CREATE TABLE public.participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concours_id UUID NOT NULL REFERENCES public.concours(id) ON DELETE CASCADE,
  
  statut VARCHAR DEFAULT 'a_faire',
  date_participation TIMESTAMP,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, concours_id)
);

-- Ingest logs (admin)
CREATE TABLE public.ingest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported INT,
  duplicates INT,
  errors TEXT[],
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_concours_date_fin ON public.concours(date_fin DESC);
CREATE INDEX idx_concours_type ON public.concours(type_participation);
CREATE INDEX idx_concours_categorie ON public.concours(categorie_lot);
CREATE INDEX idx_concours_score ON public.concours(score_pertinence DESC);
CREATE INDEX idx_participations_user ON public.participations(user_id);
CREATE INDEX idx_participations_statut ON public.participations(statut);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- All users can read contests
CREATE POLICY "Contests are readable by everyone" ON public.concours
  FOR SELECT USING (true);

-- Users can only see their own participations
CREATE POLICY "Users can only see their participations" ON public.participations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create/update their own participations
CREATE POLICY "Users can manage their own participations" ON public.participations
  USING (auth.uid() = user_id);

-- Users can read/update their own preferences
CREATE POLICY "Users can read their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = id);
```

---

## 3. Ollama Setup (Local IA)

### 3.1 Install Ollama

```bash
# macOS (M1/M2/Intel)
# Download from https://ollama.ai/download

# Linux (Ubuntu/Debian)
curl https://ollama.ai/install.sh | sh

# Windows
# Download installer from https://ollama.ai/download

# Verify installation
ollama --version
```

### 3.2 Run LLaMA Model

```bash
# Download & run LLaMA 2 7B (first time: ~3-5 min)
ollama pull llama2:7b

# Start Ollama server (runs on localhost:11434)
ollama serve

# In another terminal, test:
curl http://localhost:11434/api/generate \
  -d '{
    "model": "llama2:7b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

### 3.3 API Integration

```typescript
// lib/ollama.ts

export async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.IA_MODEL || 'llama2:7b',
      prompt,
      stream: false,
      temperature: 0, // Deterministic
      num_predict: 150 // Max tokens
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

// Test
const result = await callOllama('Score this contest as JSON: {value: 1000, effort: 10}');
console.log(result);
```

---

## 4. Next.js Project Structure

```
contest-ai/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (redirects to /dashboard)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   ├── participations/
│   │   └── page.tsx            # History
│   ├── settings/
│   │   └── page.tsx
│   └── api/
│       ├── auth/
│       ├── concours/
│       ├── participations/
│       ├── ia/
│       └── admin/
├── components/
│   ├── ContestCard.tsx
│   ├── FilterSidebar.tsx
│   ├── ParticipationBadge.tsx
│   └── ...
├── lib/
│   ├── supabase.ts
│   ├── ollama.ts
│   ├── scoring.ts
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── favicon.ico
├── .env.example
├── .env.local               # (git ignored)
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 5. Development Workflow

### 5.1 Start Dev Server

```bash
# Terminal 1: Start Next.js (port 3000)
pnpm dev

# Terminal 2: Start Ollama (port 11434) - if using local IA
ollama serve

# Terminal 3: (Optional) Watch Supabase logs
pnpm supabase start
```

### 5.2 Database Changes During Dev

```bash
# After modifying schema, create migration
pnpm supabase migration new <migration_name>

# Edit the generated file in supabase/migrations/

# Apply locally
pnpm supabase push

# Push to prod when ready
pnpm supabase db push --linked
```

### 5.3 Testing

```bash
# Run tests (jest)
pnpm test

# Run with coverage
pnpm test:coverage

# E2E tests (playwright)
pnpm e2e
```

---

## 6. Deployment to Production

### 6.1 Deploy Frontend (Vercel)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to https://vercel.com
# 3. Click "New Project" → Import GitHub repo
# 4. Select "contest-ai"
# 5. Configure Environment Variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - OPENAI_API_KEY (if using Claude)
#    - OLLAMA_API_URL (point to your hosted Ollama)

# 6. Click "Deploy"
```

### 6.2 Deploy Backend (Optional: Separate)

If using Node backend instead of Vercel Edge Functions:

```bash
# Option A: Railway.app
# 1. Go to https://railway.app
# 2. Connect GitHub repo
# 3. Add PostgreSQL database
# 4. Deploy

# Option B: Render.com
# Similar to Railway
```

### 6.3 Database Backup

```bash
# Supabase handles backups automatically (free: 1 backup/week)
# Pro plan: daily backups

# Manual backup
pnpm supabase db download > backup.sql

# Restore
pnpm supabase db push < backup.sql
```

---

## 7. Monitoring & Debugging

### 7.1 Logs

```bash
# Supabase logs
pnpm supabase logs

# Vercel logs
# Dashboard → Deployments → Details → Logs

# Local logs
# Check browser console (F12)
# Check server console (pnpm dev output)
```

### 7.2 Performance

```bash
# Lighthouse check
# Vercel dashboard shows automatically

# Local:
pnpm build
pnpm start
# Then lighthouse check
```

### 7.3 Error Tracking (Optional)

```typescript
// Add Sentry for error tracking
// lib/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.ENVIRONMENT
});
```

---

## 8. Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Supabase account created
- [ ] Supabase project setup + credentials in .env.local
- [ ] Ollama installed & running (or Claude API key)
- [ ] Git repo initialized
- [ ] `pnpm install` successful
- [ ] Database migrations applied
- [ ] `pnpm dev` runs without errors
- [ ] Localhost:3000 loads
- [ ] Can login / create account
- [ ] Can see contest list (once data imported)

---

## 9. Troubleshooting

### Issue: "Cannot connect to Supabase"
```bash
# Check credentials in .env.local
# Verify project is active on supabase.com
# Try: pnpm supabase status
```

### Issue: "Ollama connection refused"
```bash
# Check Ollama is running: ollama serve
# Check URL in .env.local matches (usually http://localhost:11434)
# Try: curl http://localhost:11434/api/generate
```

### Issue: "RLS policies blocking access"
```bash
# Check RLS is enabled correctly
# Verify auth.uid() is set after login
# Check policy conditions in Supabase SQL Editor
```

### Issue: "Slow dashboard load"
```bash
# Check indexes created in DB
# Verify RLS policies are not N+1 querying
# Monitor query performance in Supabase dashboard
```

---

## 10. CI/CD Pipeline (Optional)

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

---

**Next Steps:**
1. Create Supabase project
2. Install local dependencies
3. Setup .env.local
4. Run migrations
5. Start Ollama
6. `pnpm dev`
7. Begin development!
