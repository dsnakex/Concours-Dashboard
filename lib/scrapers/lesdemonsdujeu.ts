import { RawContest, ScraperConfig } from './types'
import {
  detectParticipationType,
  detectCategory,
  estimateTime,
  estimateValue,
  detectPurchaseRequirement,
  parseFrenchDate,
  cleanHtmlText
} from './helpers'

async function parseLesDemons_DuJeu(html: string): Promise<RawContest[]> {
  const contests: RawContest[] = []

  try {
    // Note: This is a basic HTML parsing example
    // In production, you'd want to use a proper HTML parser like cheerio
    // For now, we'll use regex (not ideal but works for demo)

    // Find contest blocks - adapt selectors based on actual website structure
    const contestPattern = /<article[^>]*class="[^"]*contest[^"]*"[^>]*>(.*?)<\/article>/gis
    const matches = html.matchAll(contestPattern)

    for (const match of matches) {
      const blockHtml = match[1]

      // Extract title
      const titleMatch = blockHtml.match(/<h[23][^>]*>(.*?)<\/h[23]>/i)
      const titre = titleMatch ? cleanHtmlText(titleMatch[1]) : ''

      // Extract link
      const linkMatch = blockHtml.match(/href="([^"]+)"/i)
      const lien_source = linkMatch ? linkMatch[1] : ''

      // Extract description
      const descMatch = blockHtml.match(/<p[^>]*>(.*?)<\/p>/i)
      const description = descMatch ? cleanHtmlText(descMatch[1]) : ''

      // Extract brand/sponsor
      const brandMatch = blockHtml.match(/sponsor[^>]*>(.*?)</i) || blockHtml.match(/marque[^>]*>(.*?)</i)
      const marque = brandMatch ? cleanHtmlText(brandMatch[1]) : undefined

      if (!titre || !lien_source) continue

      const fullText = `${titre} ${description} ${marque || ''}`
      const type_participation = detectParticipationType(fullText)

      const contest: RawContest = {
        titre,
        marque,
        description,
        lien_source: lien_source.startsWith('http') ? lien_source : `https://www.lesdemonsdujeu.com${lien_source}`,
        type_participation,
        categorie_lot: detectCategory(fullText),
        temps_estime: estimateTime(fullText, type_participation),
        valeur_estimee: estimateValue(fullText),
        achat_obligatoire: detectPurchaseRequirement(fullText)
      }

      contests.push(contest)
    }
  } catch (error) {
    console.error('Error parsing Les Demons du Jeu:', error)
  }

  return contests
}

export const lesDemons_DuJeuScraper: ScraperConfig = {
  name: 'lesdemonsdujeu',
  baseUrl: 'https://www.lesdemonsdujeu.com/concours',
  enabled: true,
  rateLimit: 2000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  parser: parseLesDemons_DuJeu
}
