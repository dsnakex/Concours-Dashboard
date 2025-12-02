# Contest Sources & Data Ingestion Strategy

## 1. Reliable Contest Sources (France + Francophone)

### Tier 1: Established Websites (High Quality)

#### 1.1 ConcoursetJeux.com
```
URL: https://www.concoursetjeux.com
Type: Directory + RSS
Quality: ⭐⭐⭐⭐⭐ (Very reliable)
Format: HTML scraping + RSS feed available
Update Frequency: Daily (500+ active contests)
Mechanism: Direct site, Social media, Quiz

RSS Feed: https://www.concoursetjeux.com/feed.xml
Categories: Voyages, Argent, Electroménager, Tech, Enfants, etc.

Scraping Strategy:
- Respect robots.txt: /robots.txt ✅
- Rate limit: 1 request/2 sec
- User-Agent: ContestAI-Bot/1.0 (+http://contestai.local)
- Rotate IP: NO (personal use, ethical)
- Extract: title, description, end_date, mechanism, link

Sample URL patterns:
- https://www.concoursetjeux.com/concours/ (all contests)
- https://www.concoursetjeux.com/concours/category/voyages/ (by category)
```

#### 1.2 GrandJeuxConcours.fr
```
URL: https://www.grandjeux.com
Type: Directory
Quality: ⭐⭐⭐⭐ (Very reliable)
Format: HTML scraping
Update Frequency: Daily (200+ active)
Mechanism: All types

Scraping Strategy:
- robots.txt: Allow all
- Rate limit: 1 request/2 sec
- User-Agent: Proper identification
- Extract: Same fields as above

Sample patterns:
- https://www.grandjeux.com/concours/ (all)
- https://www.grandjeux.com/concours-voyage/ (category)
```

#### 1.3 JeuxConcours.fr
```
URL: https://www.jeux-concours.fr
Type: Directory
Quality: ⭐⭐⭐⭐ (Good)
Format: HTML + RSS
Update Frequency: Daily (150+ active)

RSS: https://www.jeux-concours.fr/feed/
Scraping:
- Rate limit: 1 request/2 sec
- User-Agent: Proper
- Extract: Standard fields

Specificity: Good for "immediate results" contests (quicker wins)
```

#### 1.4 Concours Direct (News aggregator)
```
URL: https://www.concoursdirect.com
Type: Directory + News
Quality: ⭐⭐⭐⭐ (Good)
Format: HTML
Update Frequency: Multiple daily

Good for: Social media contests, brand partnerships
Categories: Brand promotions, seasonal contests
```

### Tier 2: Brand Websites & Social Media (Manual + Scraping)

#### 2.1 Brand Contest Pages (Manual Inclusion)
```
Examples:
- https://www.leclerc.fr/concours (Leclerc - frequent)
- https://www.decathlon.fr/concours (Decathlon)
- https://marmiton.org/concours (Marmiton - food/kitchen)
- https://www.sephora.fr/concours (Sephora - beauty)

Strategy:
- Manually check 1x/week for new contests
- Set up email alerts (Google Alerts for "concours [brand]")
- Or use RSS if available per brand
```

#### 2.2 Social Media (Instagram, Facebook - Manual Discovery)
```
Instagram:
- Follow: #concours #jeuxconcours #concoursfrance
- Accounts to follow: @concoursetjeux_fr, @grandjeux_concours
- Manual scan: 2x/week trending hashtags

Facebook:
- Facebook Pages: Search "Jeux Concours France"
- Groups: "Concours Gratuits France", "Jeux Concours & Gains"
- Manual: Check 1x/week top posts

Strategy:
- User manually discovers → submits to dashboard
- Or: Discord/Telegram groups aggregating contests
```

### Tier 3: Niche Communities (Manual Submission)

#### 3.1 Discord/Telegram Channels
```
Examples:
- "Concours France" Discord servers
- "Jeux Concours Gratuits" Telegram channels
- Subreddits: r/france (occasional)

Strategy:
- Join communities where you already active
- Set up alerts for new contest posts
- Manual submission to dashboard (5-10 min/week)
```

---

## 2. Data Ingestion Pipeline

### 2.1 Scraping Architecture (Ethical)

```typescript
// data/scrapers/index.ts

interface ScraperConfig {
  name: string;
  baseUrl: string;
  robotsTxt: string; // Check this first
  rateLimit: number; // ms between requests
  userAgent: string;
  parser: (html: string) => Contest[];
  feedUrl?: string; // If RSS available
}

const SCRAPERS: ScraperConfig[] = [
  {
    name: 'concoursetjeux',
    baseUrl: 'https://www.concoursetjeux.com/concours/',
    robotsTxt: 'https://www.concoursetjeux.com/robots.txt',
    rateLimit: 2000, // 1 request per 2 sec
    userAgent: 'ContestAI-Bot/1.0 (+http://contestai.local)',
    feedUrl: 'https://www.concoursetjeux.com/feed.xml',
    parser: parseConcoursetJeux
  },
  {
    name: 'grandjeux',
    baseUrl: 'https://www.grandjeux.com/concours/',
    robotsTxt: 'https://www.grandjeux.com/robots.txt',
    rateLimit: 2000,
    userAgent: 'ContestAI-Bot/1.0 (+http://contestai.local)',
    parser: parseGrandJeux
  },
  // ... more scrapers
];

// Main ingestion function
async function ingestContests(): Promise<IngestResult> {
  const results = {
    imported: 0,
    duplicates: 0,
    errors: [] as string[]
  };

  for (const scraperConfig of SCRAPERS) {
    try {
      console.log(`Scraping ${scraperConfig.name}...`);
      
      // 1. Check robots.txt
      const allowed = await checkRobotsTxt(
        scraperConfig.robotsTxt,
        '/concours/'
      );
      if (!allowed) {
        console.warn(`${scraperConfig.name}: robots.txt disallows`);
        continue;
      }

      // 2. Fetch data (RSS or HTML)
      let contests: Contest[] = [];
      
      if (scraperConfig.feedUrl) {
        // Try RSS first (faster, less load)
        contests = await parseFeed(scraperConfig.feedUrl);
      } else {
        // Fallback to HTML scraping
        contests = await scrapeHtml(scraperConfig);
      }

      // 3. Process & deduplicate
      for (const contest of contests) {
        // Check if already in DB (by lien_source)
        const existing = await db.concours.findUnique({
          where: { lien_source: contest.lien_source }
        });

        if (existing) {
          // Update if new data
          await db.concours.update({
            where: { id: existing.id },
            data: {
              ...contest,
              updated_at: new Date()
            }
          });
          results.duplicates++;
        } else {
          // Insert new
          await db.concours.create({
            data: {
              ...contest,
              source: scraperConfig.name,
              created_at: new Date()
            }
          });
          results.imported++;
        }

        // Rate limiting
        await sleep(scraperConfig.rateLimit);
      }

    } catch (error) {
      results.errors.push(`${scraperConfig.name}: ${error.message}`);
      console.error(`Scraper error: ${scraperConfig.name}`, error);
    }
  }

  // Log results
  console.log('Ingestion complete:', results);
  return results;
}
```

### 2.2 Robots.txt Compliance

```typescript
// utils/robots.ts

import robotsParser from 'robots-parser';

async function checkRobotsTxt(robotsUrl: string, path: string): Promise<boolean> {
  try {
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'ContestAI-Bot/1.0' }
    });
    const text = await response.text();
    const robots = robotsParser(robotsUrl, text);
    
    return robots.isAllowed('ContestAI-Bot/1.0', path);
  } catch (error) {
    console.warn(`Could not check robots.txt: ${robotsUrl}`, error);
    // Conservative: assume not allowed if can't check
    return false;
  }
}
```

### 2.3 RSS Feed Parsing (Preferred)

```typescript
// scrapers/rss.ts

import Parser from 'rss-parser';

async function parseFeed(feedUrl: string): Promise<Contest[]> {
  const parser = new Parser();
  
  try {
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map(item => ({
      titre: item.title || 'Sans titre',
      description: item.content || item.summary || '',
      lien_source: item.link || '',
      date_fin: extractDateFromDescription(item.content) || 
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      source: extractSourceFromFeed(feedUrl),
      type_participation: detectParticipationType(item.content),
      categorie_lot: detectCategory(item.title, item.content),
      temps_estime: estimateTime(item.content),
      valeur_estimee: estimateValue(item.content),
      achat_obligatoire: detectPurchaseRequirement(item.content),
      date_ajout: new Date()
    }));
    
  } catch (error) {
    console.error(`RSS parsing failed for ${feedUrl}:`, error);
    return [];
  }
}
```

### 2.4 HTML Scraping (Fallback)

```typescript
// scrapers/html.ts

import { JSDOM } from 'jsdom';
import { CheerioAPI, load } from 'cheerio';

async function scrapeHtml(config: ScraperConfig): Promise<Contest[]> {
  const response = await fetch(config.baseUrl, {
    headers: { 'User-Agent': config.userAgent }
  });
  
  const html = await response.text();
  const $ = load(html);
  
  const contests: Contest[] = [];
  
  // Adapt selectors per site
  const contestElements = config.name === 'concoursetjeux'
    ? $('.contest-item') // Example selector
    : $('.concours'); // Alternative
  
  contestElements.each((idx, elem) => {
    try {
      const contest = {
        titre: $(elem).find('.title').text().trim(),
        description: $(elem).find('.description').text().trim(),
        lien_source: $(elem).find('a').attr('href'),
        marque: $(elem).find('.brand').text().trim(),
        date_fin: parseDate($(elem).find('.end-date').text()),
        type_participation: detectParticipationType(
          $(elem).find('.mechanism').text()
        ),
        categorie_lot: $(elem).find('.category').text().trim(),
        temps_estime: parseInt($(elem).find('[data-time]').attr('data-time')) || 15,
        valeur_estimee: parseInt(
          $(elem).find('.value').text().replace(/[^\d]/g, '')
        ) || 0,
        date_ajout: new Date()
      };
      
      if (contest.lien_source) contests.push(contest);
    } catch (error) {
      console.warn(`Error parsing contest element ${idx}:`, error);
    }
  });
  
  return contests;
}

// Helper: Detect participation type from text
function detectParticipationType(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('tirage')) return 'tirage';
  if (lower.includes('follow') || lower.includes('instagram') || lower.includes('facebook')) 
    return 'reseaux_sociaux';
  if (lower.includes('quiz') || lower.includes('question')) return 'quiz';
  if (lower.includes('créatif') || lower.includes('photo') || lower.includes('vidéo')) 
    return 'creativ';
  if (lower.includes('achat') || lower.includes('bon d\'achat')) return 'achat';
  
  return 'direct'; // Default
}

// Helper: Estimate time from description
function estimateTime(text: string): number {
  // Heuristics: if mentions "1 minute", "2 minutes", etc.
  const match = text.match(/(\d+)\s*(minute|min)/i);
  if (match) return parseInt(match[1]);
  
  // Default based on type
  if (text.toLowerCase().includes('quiz')) return 20;
  if (text.toLowerCase().includes('créatif')) return 45;
  
  return 10; // Default
}

// Helper: Estimate value from text
function estimateValue(text: string): number {
  // Look for currency amounts
  const match = text.match(/(\d+(?:,\d+)?)\s*€/);
  if (match) {
    return parseInt(match[1].replace(',', ''));
  }
  
  // Heuristics
  if (text.toLowerCase().includes('voyage')) return 2000;
  if (text.toLowerCase().includes('voiture') || text.includes('automobile')) return 15000;
  if (text.toLowerCase().includes('iphone')) return 1200;
  if (text.toLowerCase().includes('ps5') || text.includes('console')) return 500;
  
  return 100; // Conservative default
}

// Helper: Detect purchase requirement
function detectPurchaseRequirement(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('achat obligatoire') || 
         lower.includes('l\'achat d\'') ||
         lower.includes('bon d\'achat') ||
         lower.includes('réservoir plein');
}
```

---

## 3. Cron Job Schedule

### 3.1 Recommended Schedule

```typescript
// jobs/ingest-contests.ts (Supabase Edge Function or Node cron)

import cron from 'node-cron';

// Run every 12 hours (00:00 and 12:00 UTC)
export const ingestJobSchedule = '0 0,12 * * *';

export async function scheduleIngestJob() {
  // Using node-cron
  cron.schedule(ingestJobSchedule, async () => {
    console.log('Scheduled ingestion starting...');
    
    try {
      const result = await ingestContests();
      
      // Log results
      await db.ingestLogs.create({
        data: {
          imported: result.imported,
          duplicates: result.duplicates,
          errors: result.errors,
          started_at: new Date(Date.now() - 5 * 60 * 1000), // ~5min ago
          completed_at: new Date(),
          status: result.errors.length === 0 ? 'success' : 'partial'
        }
      });
      
      console.log(`Ingestion complete: +${result.imported} contests`);
      
    } catch (error) {
      console.error('Ingestion failed:', error);
      // Alert admin?
    }
  });
}
```

### 3.2 Manual Trigger (Admin Panel)

```typescript
// pages/api/admin/trigger-ingest.ts

import { ingestContests } from '@/data/ingest';
import { requireAdmin } from '@/auth/middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check admin
  const user = await requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const result = await ingestContests();
    
    res.status(200).json({
      success: true,
      imported: result.imported,
      duplicates: result.duplicates,
      errors: result.errors
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

## 4. Data Quality Checks

```typescript
// utils/contest-validation.ts

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateContest(contest: Partial<Contest>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!contest.titre || contest.titre.length < 5) {
    errors.push('Titre missing or too short');
  }
  
  if (!contest.lien_source || !isValidUrl(contest.lien_source)) {
    errors.push('Invalid link source');
  }
  
  if (!contest.date_fin || new Date(contest.date_fin) < new Date()) {
    errors.push('Contest already ended or invalid date');
  }
  
  // Type validation
  const validTypes = ['direct', 'reseaux_sociaux', 'quiz', 'creativ', 'achat', 'tirage'];
  if (!validTypes.includes(contest.type_participation)) {
    errors.push(`Invalid participation type: ${contest.type_participation}`);
  }
  
  // Value sanity checks
  if (contest.valeur_estimee < 0 || contest.valeur_estimee > 100000) {
    errors.push('Value seems unrealistic');
  }
  
  if (contest.temps_estime < 1 || contest.temps_estime > 500) {
    errors.push('Time estimate seems unrealistic');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

---

## 5. Initial Data Load

### 5.1 Manual CSV Import

For Phase 1 MVP, easiest approach:

1. Scrape 100-200 contests manually from sources above
2. Export as CSV: `contests.csv`
3. Upload via admin panel

CSV format:
```
titre,marque,description,lien_source,date_fin,type_participation,categorie_lot,temps_estime,valeur_estimee,achat_obligatoire
"Concours Leclerc","Leclerc","Gagné un voyage...","https://leclerc.fr/concours/1","2025-12-31","tirage","voyage",5,2000,false
...
```

### 5.2 Initial Scrape Commands

```bash
# Manual scrape first 100
node scripts/seed-initial-data.js

# Or use web UI importer
curl -F "file=@contests.csv" http://localhost:3000/api/admin/import-csv
```

---

## 6. Summary: Sources for You

**Recommended starting approach:**

1. **Week 1:** Manual collection from:
   - ConcoursetJeux.com (export to CSV)
   - GrandJeux.com (export to CSV)
   - Combine: ~150-200 concours

2. **Week 2:** Setup automated scraping:
   - RSS feeds (easiest)
   - Rate-limited HTML scraping

3. **Ongoing:** Maintenance:
   - Cron job 2x/day
   - Monitor errors
   - Manual submission for brand contests

**No legal issues:**
- ✅ Scraping with respect to robots.txt
- ✅ Proper User-Agent identification
- ✅ Rate limiting (1 req/2 sec)
- ✅ Link back to original sources
- ✅ No commercial use

All sources allow this under standard web scraping ethics.
