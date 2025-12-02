import { ParticipationType, LotCategory } from '@/types'

// Detect participation type from text
export function detectParticipationType(text: string): ParticipationType {
  const lower = text.toLowerCase()

  if (lower.includes('tirage') || lower.includes('au sort')) return 'tirage'
  if (lower.includes('follow') || lower.includes('instagram') || lower.includes('facebook') || lower.includes('twitter') || lower.includes('réseaux sociaux'))
    return 'reseaux_sociaux'
  if (lower.includes('quiz') || lower.includes('question') || lower.includes('qcm')) return 'quiz'
  if (lower.includes('créatif') || lower.includes('photo') || lower.includes('vidéo') || lower.includes('création'))
    return 'creativ'
  if (lower.includes('achat') || lower.includes("bon d'achat")) return 'achat'

  return 'direct'
}

// Detect category from text
export function detectCategory(text: string): LotCategory {
  const lower = text.toLowerCase()

  if (lower.includes('voyage') || lower.includes('séjour') || lower.includes('hôtel') || lower.includes('week-end'))
    return 'voyage'
  if (lower.includes('tech') || lower.includes('iphone') || lower.includes('ordinateur') || lower.includes('console') || lower.includes('ps5') || lower.includes('macbook') || lower.includes('smartphone'))
    return 'tech'
  if (lower.includes('argent') || lower.includes('euro') || lower.includes('€') || lower.includes('cash') || lower.includes('bon d\'achat') || lower.includes('carte cadeau'))
    return 'argent'
  if (lower.includes('enfant') || lower.includes('bébé') || lower.includes('jouet') || lower.includes('lego'))
    return 'enfants'

  return 'autre'
}

// Estimate time from description
export function estimateTime(text: string, type: ParticipationType): number {
  const lower = text.toLowerCase()

  // Check for explicit time mentions
  const match = lower.match(/(\d+)\s*(minute|min)/i)
  if (match) return parseInt(match[1])

  // Default based on type
  switch (type) {
    case 'tirage':
    case 'direct':
      return 5
    case 'quiz':
      return 15
    case 'reseaux_sociaux':
      return 8
    case 'creativ':
      return 60
    case 'achat':
      return 10
    default:
      return 10
  }
}

// Estimate value from text
export function estimateValue(text: string): number {
  const lower = text.toLowerCase()

  // Look for explicit amounts
  const euroMatch = text.match(/(\d+(?:[,\.]\d+)?)\s*€/)
  if (euroMatch) {
    return parseInt(euroMatch[1].replace(/[,\.]/g, ''))
  }

  // Heuristics based on keywords
  if (lower.includes('iphone')) return 1200
  if (lower.includes('macbook') || lower.includes('ordinateur portable')) return 1500
  if (lower.includes('ps5') || lower.includes('playstation 5')) return 500
  if (lower.includes('console')) return 400
  if (lower.includes('voyage') || lower.includes('séjour')) return 1500
  if (lower.includes('week-end')) return 300
  if (lower.includes('voiture') || lower.includes('automobile')) return 15000
  if (lower.includes('télé') || lower.includes('tv')) return 600

  return 200 // Conservative default
}

// Detect purchase requirement
export function detectPurchaseRequirement(text: string): boolean {
  const lower = text.toLowerCase()
  return lower.includes('achat obligatoire') ||
         lower.includes("l'achat d") ||
         lower.includes('avec achat') ||
         lower.includes('bon d\'achat de')
}

// Parse date from French text
export function parseFrenchDate(dateStr: string): Date | null {
  if (!dateStr) return null

  try {
    // Try ISO format first
    const isoDate = new Date(dateStr)
    if (!isNaN(isoDate.getTime())) return isoDate

    // French months
    const months: Record<string, number> = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
      'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
      'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    }

    // Try formats like "31 décembre 2025"
    const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/)
    if (match) {
      const day = parseInt(match[1])
      const month = months[match[2].toLowerCase()]
      const year = parseInt(match[3])

      if (month !== undefined) {
        return new Date(year, month, day)
      }
    }

    // Default: 30 days from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    return defaultDate
  } catch (error) {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    return defaultDate
  }
}

// Clean HTML content
export function cleanHtmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Sleep helper for rate limiting
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
