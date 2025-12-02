import * as cheerio from 'cheerio'
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
    const $ = cheerio.load(html)

    // Try multiple common selectors for contest listings
    const selectors = [
      'article.contest',
      'article[class*="concours"]',
      'div.contest-item',
      'div[class*="concours"]',
      '.contest-card',
      'article',
      '.post',
      '.entry'
    ]

    let contestElements: cheerio.Cheerio<any> | null = null

    // Find the first selector that returns results
    for (const selector of selectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        contestElements = elements
        console.log(`Found ${elements.length} contests using selector: ${selector}`)
        break
      }
    }

    if (!contestElements || contestElements.length === 0) {
      console.warn('No contest elements found with any selector')
      return contests
    }

    // Parse each contest
    contestElements.each((_, element) => {
      try {
        const $el = $(element)

        // Extract title - try multiple approaches
        let titre = ''
        const titleSelectors = ['h2', 'h3', '.title', '.contest-title', '[class*="title"]', 'a[href*="concours"]']
        for (const sel of titleSelectors) {
          const titleEl = $el.find(sel).first()
          if (titleEl.length > 0) {
            titre = cleanHtmlText(titleEl.text())
            if (titre) break
          }
        }

        // Extract link - try multiple approaches
        let lien_source = ''
        const linkEl = $el.find('a[href*="concours"]').first() || $el.find('a').first()
        if (linkEl.length > 0) {
          lien_source = linkEl.attr('href') || ''
          // Make absolute URL if relative
          if (lien_source && !lien_source.startsWith('http')) {
            lien_source = lien_source.startsWith('/')
              ? `https://www.lesdemonsdujeu.com${lien_source}`
              : `https://www.lesdemonsdujeu.com/${lien_source}`
          }
        }

        // Skip if missing critical data
        if (!titre || !lien_source) {
          return // Continue to next element
        }

        // Extract description
        let description = ''
        const descSelectors = ['p', '.description', '.excerpt', '[class*="desc"]', '.content']
        for (const sel of descSelectors) {
          const descEl = $el.find(sel).first()
          if (descEl.length > 0) {
            description = cleanHtmlText(descEl.text())
            if (description && description.length > 20) break
          }
        }

        // Extract brand/sponsor
        let marque: string | undefined
        const brandSelectors = ['.brand', '.sponsor', '.marque', '[class*="brand"]', '[class*="sponsor"]']
        for (const sel of brandSelectors) {
          const brandEl = $el.find(sel).first()
          if (brandEl.length > 0) {
            marque = cleanHtmlText(brandEl.text())
            if (marque) break
          }
        }

        // Extract date if available
        let date_fin: string | undefined
        const dateSelectors = ['.date', '.deadline', '.end-date', '[class*="date"]', 'time']
        for (const sel of dateSelectors) {
          const dateEl = $el.find(sel).first()
          if (dateEl.length > 0) {
            const dateText = cleanHtmlText(dateEl.text())
            const parsed = parseFrenchDate(dateText)
            if (parsed) {
              date_fin = parsed.toISOString()
              break
            }
          }
        }

        // Combine all text for analysis
        const fullText = `${titre} ${description} ${marque || ''}`
        const type_participation = detectParticipationType(fullText)

        const contest: RawContest = {
          titre,
          marque,
          description: description || titre,
          lien_source,
          type_participation,
          categorie_lot: detectCategory(fullText),
          temps_estime: estimateTime(fullText, type_participation),
          valeur_estimee: estimateValue(fullText),
          achat_obligatoire: detectPurchaseRequirement(fullText),
          date_fin
        }

        contests.push(contest)
      } catch (error) {
        console.error('Error parsing individual contest:', error)
      }
    })

    console.log(`Successfully parsed ${contests.length} contests from Les Demons du Jeu`)
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
