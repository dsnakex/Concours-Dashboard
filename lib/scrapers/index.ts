import { supabase } from '@/lib/supabase'
import { ScraperConfig, ScraperResult, RawContest } from './types'
import { lesDemons_DuJeuScraper } from './lesdemonsdujeu'
import { sleep } from './helpers'

// List of all available scrapers
const SCRAPERS: ScraperConfig[] = [
  lesDemons_DuJeuScraper,
  // Add more scrapers here as needed
]

export async function scrapeSource(config: ScraperConfig): Promise<ScraperResult> {
  const result: ScraperResult = {
    source: config.name,
    imported: 0,
    duplicates: 0,
    errors: []
  }

  if (!config.enabled) {
    result.errors.push('Scraper is disabled')
    return result
  }

  try {
    console.log(`Scraping ${config.name}...`)

    // Fetch the page
    const response = await fetch(config.baseUrl, {
      headers: {
        'User-Agent': config.userAgent
      }
    })

    if (!response.ok) {
      result.errors.push(`HTTP ${response.status}: ${response.statusText}`)
      return result
    }

    const html = await response.text()

    // Parse contests
    const contests = await config.parser(html)

    console.log(`Found ${contests.length} contests from ${config.name}`)

    // Process each contest
    for (const contest of contests) {
      try {
        // Check if contest already exists
        const { data: existing } = await supabase
          .from('concours')
          .select('id')
          .eq('lien_source', contest.lien_source)
          .single()

        if (existing) {
          result.duplicates++
          continue
        }

        // Insert new contest
        const { error } = await supabase
          .from('concours')
          .insert({
            ...contest,
            source: config.name,
            date_fin: contest.date_fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'actif',
            score_pertinence: 0.5, // Default score
            raison_score: 'Score calculé automatiquement lors de la première consultation',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          result.errors.push(`Failed to insert "${contest.titre}": ${error.message}`)
        } else {
          result.imported++
        }

        // Rate limiting
        await sleep(config.rateLimit)
      } catch (error: any) {
        result.errors.push(`Error processing contest: ${error.message}`)
      }
    }
  } catch (error: any) {
    result.errors.push(`Scraping failed: ${error.message}`)
  }

  return result
}

export async function scrapeAllSources(): Promise<ScraperResult[]> {
  const results: ScraperResult[] = []

  for (const scraper of SCRAPERS) {
    if (scraper.enabled) {
      const result = await scrapeSource(scraper)
      results.push(result)
    }
  }

  return results
}

export { SCRAPERS }
