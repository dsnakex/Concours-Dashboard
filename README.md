# Contest AI - Dashboard de Jeux-Concours

Plateforme personnelle d'agrégation et de scoring de jeux-concours français avec IA.

## 🚀 Fonctionnalités

- ✅ Agrégation de concours de sources fiables
- ✅ Filtrage intelligent par type de participation
- ✅ Scoring IA hybride (règles + LLM)
- ✅ Suivi des participations (À faire → Participé → Gagné)
- ✅ 100% gratuit et légal (assistance uniquement, pas d'automatisation)

## 📋 Stack Technique

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: Supabase PostgreSQL
- **IA**: Ollama local (LLaMA 2 7B) ou Claude API
- **Auth**: Supabase Auth
- **Deploy**: Vercel

## 🛠️ Installation

### Prérequis

- Node.js 18+ ([télécharger](https://nodejs.org/))
- npm ou pnpm
- Un compte Supabase (gratuit) - [s'inscrire](https://supabase.com)
- (Optionnel) Ollama pour l'IA locale - [installer](https://ollama.ai)

### 1. Cloner le repository

\`\`\`bash
git clone <repo-url>
cd Concours-Dashboard
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Configuration Supabase

1. Créez un nouveau projet sur [supabase.com](https://supabase.com)
2. Allez dans **Settings → API**
3. Copiez les clés suivantes :
   - `URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` → SUPABASE_SERVICE_ROLE_KEY

### 4. Créer .env.local

Copiez \`.env.example\` vers \`.env.local\` et remplissez les valeurs :

\`\`\`bash
cp .env.example .env.local
\`\`\`

Éditez \`.env.local\` :

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

IA_MODEL=ollama
OLLAMA_API_URL=http://localhost:11434

NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVIRONMENT=development
\`\`\`

### 5. Créer les tables de la base de données

Dans le dashboard Supabase :
1. Allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez le contenu de \`supabase/migrations/001_initial_schema.sql\`
4. Exécutez la query

### 6. (Optionnel) Setup Ollama pour l'IA locale

\`\`\`bash
# Installer Ollama (macOS/Linux)
curl https://ollama.ai/install.sh | sh

# Télécharger le modèle LLaMA 2
ollama pull llama2:7b

# Lancer le serveur Ollama
ollama serve
\`\`\`

Le serveur Ollama sera accessible sur \`http://localhost:11434\`.

**Alternative**: Utilisez Claude API au lieu d'Ollama en modifiant \`IA_MODEL=claude\` dans \`.env.local\`.

### 7. Lancer l'application

\`\`\`bash
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📊 Structure du Projet

\`\`\`
Concours-Dashboard/
├── app/
│   ├── auth/          # Pages d'authentification
│   ├── dashboard/     # Page principale
│   ├── api/           # API routes (à implémenter)
│   └── layout.tsx     # Layout racine
├── components/
│   ├── ContestCard.tsx
│   └── FilterSidebar.tsx
├── lib/
│   ├── supabase.ts    # Client Supabase
│   ├── auth.ts        # Fonctions auth
│   └── scoring.ts     # Moteur de scoring IA
├── supabase/
│   └── migrations/    # Migrations SQL
├── types/
│   └── index.ts       # Types TypeScript
└── public/            # Assets statiques
\`\`\`

## 🎯 Usage

### 1. Créer un compte

Allez sur \`/auth/signup\` et créez votre compte.

### 2. Importer des concours

Pour le moment, les concours doivent être ajoutés manuellement dans Supabase.

Vous pouvez insérer des concours de test avec cette query SQL :

\`\`\`sql
INSERT INTO concours (
  titre, marque, description, lien_source,
  type_participation, categorie_lot,
  temps_estime, valeur_estimee,
  date_fin, score_pertinence,
  conditions_resumees, raison_score
) VALUES (
  'Gagnez un iPhone 15',
  'Apple France',
  'Participez pour gagner le dernier iPhone 15 Pro',
  'https://example.com/concours-iphone',
  'tirage',
  'tech',
  5,
  1200,
  '2025-12-31',
  0.85,
  'Gratuit, France 18+',
  'Lot intéressant: 1200€ • Rapide: 5 min • Tirage simple (gratuit)'
);
\`\`\`

### 3. Explorer le dashboard

- Utilisez les **filtres** pour affiner votre recherche
- Cliquez sur **Participer** pour accéder au concours
- Marquez vos participations avec le menu **⋮**

## 📝 Prochaines étapes

Fonctionnalités à implémenter :

- [ ] Page Participations (historique)
- [ ] Page Settings (préférences)
- [ ] API routes pour CRUD
- [ ] Pipeline d'ingestion de données automatique
- [ ] Intégration Ollama complète pour le scoring
- [ ] Résumés de conditions par IA
- [ ] Admin panel pour gérer les concours

## 🔒 Sécurité

- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Authentification Supabase sécurisée
- ✅ Variables d'environnement pour les secrets
- ✅ Pas d'automatisation (respect des CGU)

## 📄 License

Ce projet est à usage personnel uniquement.

## 🤝 Support

Pour toute question, consultez la documentation dans les fichiers \`*.md\` à la racine du projet :

- \`01_PROJECT_BRIEF.md\` - Spécifications complètes
- \`02_API_SPEC.md\` - Documentation API
- \`03_IA_SCORING_ENGINE.md\` - Algorithme de scoring
- \`04_DATA_SOURCES_INGESTION.md\` - Sources de données
- \`05_TECHNICAL_SETUP.md\` - Setup technique détaillé
- \`06_UI_UX_COMPONENTS.md\` - Composants UI

## 🎉 Bon développement !

N'hésitez pas à personnaliser le projet selon vos besoins.
