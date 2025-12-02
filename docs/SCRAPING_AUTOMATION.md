# Automatisation du Scraping - Documentation

## 🔄 Système de Récupération Automatique

Le dashboard récupère automatiquement les nouveaux concours depuis des sites externes grâce à un système de scraping intelligent.

## ⚙️ Configuration Actuelle

### Cron Job Vercel
- **Fréquence** : Tous les jours à 8h00 (heure UTC)
- **Endpoint** : `/api/admin/ingest`
- **Configuration** : `vercel.json` → section `crons`

```json
{
  "crons": [{
    "path": "/api/admin/ingest",
    "schedule": "0 8 * * *"
  }]
}
```

### Format Cron
Le format est : `minute heure jour_mois mois jour_semaine`

Exemples :
- `0 8 * * *` - Tous les jours à 8h00
- `0 */6 * * *` - Toutes les 6 heures
- `0 8,20 * * *` - À 8h et 20h chaque jour
- `0 8 * * 1` - Tous les lundis à 8h

## 🤖 Scrapers Disponibles

### 1. LesDemonsduJeu (`lesdemonsdujeu`)
- **URL** : https://www.lesdemonsdujeu.com/concours
- **Technologie** : Cheerio (parsing HTML robuste)
- **Rate Limit** : 2 secondes entre chaque requête
- **Status** : ✅ Activé

#### Fonctionnalités
- ✅ Détection adaptative des sélecteurs CSS
- ✅ Extraction multi-approche (titre, lien, description, marque, date)
- ✅ Gestion des URLs relatives/absolues
- ✅ Détection automatique du type de participation
- ✅ Estimation de la valeur et du temps requis
- ✅ Dédoublonnage automatique

## 📊 Processus de Scraping

### Étape 1 : Récupération
```
Cron Job (8h) → API /api/admin/ingest → scrapeAllSources()
```

### Étape 2 : Parsing Intelligent
```typescript
// Le scraper essaie plusieurs sélecteurs CSS
const selectors = [
  'article.contest',
  'article[class*="concours"]',
  'div.contest-item',
  // ... 8 sélecteurs au total
]

// Puis extrait les informations avec fallbacks multiples
```

### Étape 3 : Enrichissement
- Type de participation (direct, quiz, réseaux sociaux, etc.)
- Catégorie du lot (voyage, tech, argent, etc.)
- Temps estimé selon la complexité
- Valeur estimée du lot
- Détection d'achat obligatoire

### Étape 4 : Insertion en Base
- Vérification des doublons via `lien_source`
- Score initial à 0.5
- Statut "actif"
- Logging dans `ingest_logs`

## 🔍 Monitoring

### Vérifier les Logs d'Ingestion
```sql
SELECT * FROM ingest_logs
ORDER BY started_at DESC
LIMIT 10;
```

### Stats d'un Scraping
```sql
SELECT
  source,
  COUNT(*) as total_concours,
  MAX(created_at) as derniere_import
FROM concours
GROUP BY source;
```

## 🚀 Déclencher Manuellement

### Via cURL
```bash
# Tous les scrapers
curl -X POST https://votre-site.vercel.app/api/admin/ingest

# Scraper spécifique
curl -X POST https://votre-site.vercel.app/api/admin/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "lesdemonsdujeu"}'
```

### Via Page Admin (à créer)
```typescript
// Exemple de bouton React
<button onClick={async () => {
  const res = await fetch('/api/admin/ingest', { method: 'POST' })
  const data = await res.json()
  console.log(`Importés: ${data.totals.imported}`)
}}>
  Actualiser les Concours
</button>
```

## 📝 Ajouter un Nouveau Scraper

### 1. Créer le Scraper
```typescript
// lib/scrapers/nouveau_site.ts
import * as cheerio from 'cheerio'
import { RawContest, ScraperConfig } from './types'

async function parseNouveauSite(html: string): Promise<RawContest[]> {
  const $ = cheerio.load(html)
  const contests: RawContest[] = []

  // Votre logique de parsing ici

  return contests
}

export const nouveauSiteScraper: ScraperConfig = {
  name: 'nouveau_site',
  baseUrl: 'https://exemple.com/concours',
  enabled: true,
  rateLimit: 2000,
  userAgent: 'Mozilla/5.0...',
  parser: parseNouveauSite
}
```

### 2. L'Ajouter à l'Index
```typescript
// lib/scrapers/index.ts
import { nouveauSiteScraper } from './nouveau_site'

const SCRAPERS: ScraperConfig[] = [
  lesDemons_DuJeuScraper,
  nouveauSiteScraper, // 👈 Ajouter ici
]
```

## ⚠️ Bonnes Pratiques

### Rate Limiting
- **Minimum** : 2 secondes entre chaque requête
- **Recommandé** : 3-5 secondes pour les gros sites
- Respecter le fichier `robots.txt` du site

### User-Agent
Utiliser un User-Agent réaliste de navigateur récent :
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

### Gestion d'Erreurs
- ✅ Logs détaillés dans la console
- ✅ Continuation même si un concours échoue
- ✅ Enregistrement des erreurs dans `ingest_logs`

### Protection Anti-Ban
- Rate limiting respecté
- User-Agent réaliste
- Pas de requêtes parallèles sur le même domaine
- Gestion des erreurs 403/429

## 🛠️ Dépannage

### Le scraper ne trouve rien
1. Vérifier que le site n'a pas changé sa structure
2. Tester les sélecteurs CSS dans DevTools
3. Vérifier les logs : `console.log` dans le parser

### Erreur 403 Forbidden
- Le site bloque le scraping
- Essayer un User-Agent différent
- Augmenter le rate limit
- Contacter le site pour une API officielle

### Doublons
- Le système vérifie automatiquement via `lien_source`
- Si doublons persistants, vérifier la normalisation des URLs

## 📚 Références

- **Cheerio Docs** : https://cheerio.js.org/
- **Vercel Cron** : https://vercel.com/docs/cron-jobs
- **Cron Syntax** : https://crontab.guru/
- **robots.txt** : https://developers.google.com/search/docs/crawling-indexing/robots/intro
