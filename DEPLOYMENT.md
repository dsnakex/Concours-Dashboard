# 🚀 Guide de Déploiement - Contest AI Dashboard

## Déploiement sur Vercel (Recommandé)

### Étape 1 : Préparer Supabase

1. **Créer un projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Cliquez sur "New Project"
   - Choisissez la région **Europe** (plus proche de la France)
   - Nom du projet : `contest-ai` (ou autre)
   - Mot de passe de base de données : choisissez-en un fort

2. **Exécuter les migrations SQL**
   - Une fois le projet créé, allez dans **SQL Editor**
   - Créez une nouvelle query
   - Copiez tout le contenu de `supabase/migrations/001_initial_schema.sql`
   - Cliquez sur **Run** pour créer toutes les tables

3. **Récupérer les credentials**
   - Allez dans **Settings → API**
   - Notez ces 3 valeurs :
     - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
     - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
     - `service_role` (cliquez sur "Reveal") → SUPABASE_SERVICE_ROLE_KEY

---

### Étape 2 : Déployer sur Vercel

#### Option A : Déploiement automatique (Recommandé)

1. **Connecter GitHub à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub : `dsnakex/Concours-Dashboard`

2. **Configurer le projet**
   - Framework Preset : **Next.js** (détecté automatiquement)
   - Root Directory : `.` (racine)
   - Build Command : `npm run build`
   - Output Directory : `.next`

3. **Variables d'environnement**

   Ajoutez ces variables dans la section "Environment Variables" :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key-ici
   IA_MODEL=ollama
   OLLAMA_API_URL=http://localhost:11434
   NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
   ENVIRONMENT=production
   ```

   **⚠️ Important :** Remplacez les valeurs par vos vraies credentials Supabase de l'Étape 1.

4. **Déployer**
   - Cliquez sur **Deploy**
   - Vercel va build et déployer automatiquement
   - Durée : ~2-3 minutes

5. **Obtenir l'URL**
   - Une fois déployé, vous aurez une URL : `https://contest-ai-dashboard-xxx.vercel.app`
   - Notez cette URL et mettez-la à jour dans `NEXT_PUBLIC_APP_URL`

#### Option B : Déploiement via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivez les prompts :
# - Set up and deploy? Yes
# - Which scope? (votre compte)
# - Link to existing project? No
# - Project name? contest-ai-dashboard
# - In which directory? ./
# - Override settings? No

# Une fois déployé, ajoutez les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... etc

# Redéployer avec les variables
vercel --prod
```

---

### Étape 3 : Configuration post-déploiement

1. **Tester l'authentification**
   - Allez sur votre URL Vercel
   - Cliquez sur "Créer un compte" (`/auth/signup`)
   - Créez un compte de test
   - Vérifiez que vous êtes redirigé vers `/dashboard`

2. **Ajouter des données de test**

   Dans Supabase SQL Editor, exécutez :

   ```sql
   INSERT INTO concours (
     titre, marque, description, lien_source,
     type_participation, categorie_lot,
     temps_estime, valeur_estimee,
     date_fin, score_pertinence,
     conditions_resumees, raison_score
   ) VALUES
   (
     'Gagnez un iPhone 15 Pro',
     'Apple France',
     'Participez pour gagner le dernier iPhone 15 Pro. Tirage au sort simple et gratuit.',
     'https://example.com/concours-iphone-' || gen_random_uuid()::text,
     'tirage',
     'tech',
     5,
     1200,
     NOW() + INTERVAL '30 days',
     0.85,
     'Gratuit, France 18+, Fin dans 30 jours',
     'Lot intéressant: 1200€ • Rapide: 5 min • Tirage simple (gratuit)'
   ),
   (
     'Voyage aux Maldives à gagner',
     'Agence Voyages Plus',
     'Gagnez un séjour de 7 jours aux Maldives pour 2 personnes.',
     'https://example.com/concours-maldives-' || gen_random_uuid()::text,
     'direct',
     'voyage',
     10,
     3000,
     NOW() + INTERVAL '45 days',
     0.90,
     'Gratuit, France 18+, Formulaire simple',
     'Lot exceptionnel: 3000€ • Rapide: 10 min • Formulaire direct'
   ),
   (
     'Console PS5 à gagner',
     'PlayStation France',
     'Tentez de gagner une PlayStation 5 avec 2 jeux inclus.',
     'https://example.com/concours-ps5-' || gen_random_uuid()::text,
     'quiz',
     'tech',
     15,
     600,
     NOW() + INTERVAL '20 days',
     0.75,
     'Gratuit, France 18+, Quiz simple',
     'Bonne valeur: 600€ • Quiz simple • Populaire'
   ),
   (
     'Bon d''achat Décathlon 500€',
     'Décathlon',
     'Gagnez un bon d''achat de 500€ valable dans tous les magasins Décathlon.',
     'https://example.com/concours-decathlon-' || gen_random_uuid()::text,
     'reseaux_sociaux',
     'argent',
     8,
     500,
     NOW() + INTERVAL '15 days',
     0.65,
     'Gratuit, France 18+, Follow Instagram requis',
     'Bon lot: 500€ • Rapide mais réseaux sociaux'
   );
   ```

3. **Vérifier le dashboard**
   - Retournez sur `/dashboard`
   - Vous devriez voir les 4 concours de test
   - Testez les filtres, la recherche, le tri
   - Testez de marquer un concours (⋮ → Participé)

---

## Configuration Ollama (Optionnel)

Pour activer le scoring IA, vous avez 2 options :

### Option 1 : Utiliser Ollama local (développement uniquement)

```bash
# Installer Ollama
curl https://ollama.ai/install.sh | sh

# Télécharger LLaMA 2
ollama pull llama2:7b

# Lancer le serveur
ollama serve
```

**Note :** Ollama local ne fonctionnera pas en production Vercel (pas d'accès localhost).

### Option 2 : Utiliser une API IA externe (production)

Pour la production, vous devrez utiliser une API cloud :

- **Claude API** (Anthropic) - Recommandé
- **OpenAI API** (GPT-3.5/4)
- **Ollama Cloud** (si disponible)

Modifiez `lib/scoring.ts` pour pointer vers l'API choisie.

---

## Domaine personnalisé (Optionnel)

1. Dans Vercel Dashboard → Settings → Domains
2. Ajoutez votre domaine : `contest-ai.votre-domaine.com`
3. Configurez les DNS selon les instructions Vercel
4. Mettez à jour `NEXT_PUBLIC_APP_URL` avec votre nouveau domaine

---

## Monitoring et Logs

### Voir les logs Vercel

```bash
# Via CLI
vercel logs [deployment-url]

# Via Dashboard
# Vercel Dashboard → Deployments → Cliquez sur un deployment → Logs
```

### Voir les logs Supabase

- Supabase Dashboard → Logs
- Filtrez par type : Database, Auth, API

---

## Troubleshooting

### Erreur : "supabaseUrl is required"

➡️ Vérifiez que les variables d'environnement sont bien configurées dans Vercel.

### Les concours ne s'affichent pas

➡️ Vérifiez que :
1. Les migrations SQL ont bien été exécutées
2. Vous avez inséré des données de test
3. Les RLS policies sont activées
4. Vous êtes bien connecté avec un compte

### Erreur 500 au login

➡️ Vérifiez que :
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correct
2. Supabase Auth est activé (Project Settings → Authentication)

### Build failed sur Vercel

➡️ Vérifiez les logs de build. Souvent :
- Variables d'environnement manquantes
- Erreurs TypeScript (fixées dans le code)

---

## 🎉 Déploiement terminé !

Votre application Contest AI Dashboard est maintenant en ligne !

**URL de déploiement :** `https://votre-app.vercel.app`

### Prochaines étapes :

1. ✅ Testez l'authentification
2. ✅ Ajoutez des données de test
3. ✅ Testez toutes les fonctionnalités
4. 🔧 Ajoutez les pages manquantes (Participations, Settings)
5. 🔧 Implémentez le pipeline d'ingestion de données
6. 🔧 Configurez l'IA pour le scoring automatique

**Bon test ! 🚀**
