import { Contest, ContestScore, IAAnalysis, UserSettings } from '@/types'

// Configuration constants
const SCORING_CONFIG = {
  BASE_SCORE_MAX: 50,
  IA_ADJUSTMENT_RANGE: [-30, 30],
  USER_ADJUSTMENT_RANGE: [-20, 20],
  FINAL_SCORE_MAX: 100,

  EFFORT_WEIGHTS: {
    VERY_QUICK: { threshold: 5, points: 10 },
    QUICK: { threshold: 15, points: 8 },
    MEDIUM: { threshold: 30, points: 6 },
    LONG: { threshold: 60, points: 3 },
    VERY_LONG: { threshold: Infinity, points: 1 }
  },

  VALUE_BRACKETS: [
    { max: 100, points: 1 },
    { max: 500, points: 3 },
    { max: 1000, points: 6 },
    { max: 2000, points: 8 },
    { max: Infinity, points: 10 }
  ],

  CACHE_DURATION_MS: 24 * 60 * 60 * 1000,
  LLM_TIMEOUT_MS: 5000,
  LLM_MODEL: 'llama2:7b'
}

// Helper function to calculate days since creation
function daysSinceCreation(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

// 1. Value Component (0-10 points)
function scoreValue(valeur_estimee: number, nombre_lots: number): number {
  const totalValue = valeur_estimee * nombre_lots

  for (const bracket of SCORING_CONFIG.VALUE_BRACKETS) {
    if (totalValue <= bracket.max) {
      return bracket.points
    }
  }

  return 10 // Max value
}

// 2. Effort Component (0-10 points, inverted)
function scoreEffort(temps_estime: number): number {
  for (const [key, config] of Object.entries(SCORING_CONFIG.EFFORT_WEIGHTS)) {
    if (temps_estime <= config.threshold) {
      return config.points
    }
  }

  return 1 // Very long
}

// 3. Mechanics Bonus (0-15 points)
function scoreMechanics(type_participation: string, achat_obligatoire: boolean): number {
  const mechanicsBonus: Record<string, number> = {
    'tirage': 15,
    'direct': 12,
    'quiz': 8,
    'creativ': 5,
    'reseaux_sociaux': 6,
    'achat': -20
  }

  let score = mechanicsBonus[type_participation] || 0

  if (achat_obligatoire) {
    score -= 10
  }

  return Math.max(0, score)
}

// 4. Popularity Component (0-15 points)
function scorePopularity(
  clicks_count: number,
  comments_count: number,
  days_active: number
): number {
  const clicksPerDay = clicks_count / Math.max(days_active, 1)
  const totalEngagement = (clicksPerDay * 0.7) + (comments_count * 0.3)

  if (totalEngagement > 100) return 15
  if (totalEngagement > 50) return 12
  if (totalEngagement > 20) return 8
  if (totalEngagement > 5) return 4
  return 0
}

// 5. Legitimacy Check (0-10 points)
function scoreLegitimacy(
  source: string,
  description_length: number,
  has_conditions: boolean
): number {
  let score = 10

  const doubtfulSources = ['unknown', 'manual_unverified']
  if (doubtfulSources.includes(source)) score -= 8

  if (description_length < 50) score -= 5

  if (!has_conditions) score -= 3

  return Math.max(0, score)
}

// Calculate Base Score (Rules-Based, 0-50 points)
export function calculateBaseScore(contest: Contest): number {
  const value = scoreValue(contest.valeur_estimee, contest.nombre_lots)
  const effort = scoreEffort(contest.temps_estime)
  const mechanics = scoreMechanics(contest.type_participation, contest.achat_obligatoire)
  const popularity = scorePopularity(
    contest.clicks_count || 0,
    contest.comments_count || 0,
    daysSinceCreation(contest.date_ajout)
  )
  const legitimacy = scoreLegitimacy(
    contest.source,
    contest.description?.length || 0,
    !!contest.conditions_resumees
  )

  const baseScore = value + effort + mechanics + popularity + legitimacy

  return Math.min(50, baseScore)
}

// Get IA Adjustment (LLM-based, -30 to +30)
export async function getIAAdjustment(contest: Contest): Promise<IAAnalysis> {
  // Skip if description too short
  if ((contest.description || '').length < 30) {
    return { adjustment: 0, explanation: 'Insufficient data' }
  }

  const prompt = `Analyse ce concours pour sa légitimité et sa valeur réelle:

Titre: "${contest.titre}"
Description: "${contest.description}"
Type: ${contest.type_participation}
Valeur estimée: ${contest.valeur_estimee}€
Temps estimé: ${contest.temps_estime} mins
Conditions: "${contest.conditions_resumees}"

Score ce concours sur:
1. Légitimité (0-10): Est-ce un concours réel et de confiance?
2. Clarté (0-10): Les conditions sont-elles claires et non trompeuses?
3. Pièges cachés (0-10): Y a-t-il des exigences cachées ou de la complexité?
4. Valeur réelle (0-10): La valeur estimée est-elle exacte?

Retourne UNIQUEMENT du JSON:
{
  "legitimacy": 8,
  "clarity": 7,
  "hidden_catches": 3,
  "true_value": 9,
  "adjustment": -5,
  "explanation": "Concours réel mais conditions quelque peu complexes"
}

Échelle d'ajustement:
- Ajustement -30: Drapeaux rouges majeurs
- Ajustement -10: Quelques préoccupations
- Ajustement 0: Neutre
- Ajustement +10: Semble bien
- Ajustement +30: Excellente opportunité`

  try {
    // Call Ollama or Claude API
    const response = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: SCORING_CONFIG.LLM_MODEL,
        prompt,
        stream: false,
        temperature: 0,
        num_predict: 200
      }),
      signal: AbortSignal.timeout(SCORING_CONFIG.LLM_TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.response)

    return {
      adjustment: analysis.adjustment || 0,
      explanation: analysis.explanation || '',
      scores: {
        legitimacy: analysis.legitimacy,
        clarity: analysis.clarity,
        hidden_catches: analysis.hidden_catches,
        true_value: analysis.true_value
      }
    }
  } catch (error) {
    console.warn('LLM call failed:', error)
    return { adjustment: 0, explanation: 'LLM unavailable' }
  }
}

// User Preferences Adjustment (0-20 points)
export function getUserPreferenceAdjustment(
  contest: Contest,
  userSettings: UserSettings
): number {
  let adjustment = 0

  // Match user interests
  if (userSettings.categories_interessantes?.includes(contest.categorie_lot)) {
    adjustment += 10
  }

  // Match participation type preferences
  if (
    contest.type_participation &&
    !userSettings.types_participation_masquees?.includes(contest.type_participation)
  ) {
    adjustment += 5
  }

  // Penalty for masked types
  if (userSettings.types_participation_masquees?.includes(contest.type_participation)) {
    adjustment -= 20
  }

  // Bonus for quick participations
  if (contest.temps_estime <= 10) {
    adjustment += 5
  }

  return Math.max(-20, Math.min(20, adjustment))
}

// Generate Reasoning
function generateReasoning(scoreData: {
  baseScore: number
  iaAdjustment: number
  userAdjustment: number
  finalScore: number
  contest: Contest
}): string {
  const { contest, iaAdjustment, userAdjustment } = scoreData

  const reasons: string[] = []

  if (contest.valeur_estimee > 1000) {
    reasons.push(`Lot intéressant: ${contest.valeur_estimee}€`)
  }

  if (contest.temps_estime <= 15) {
    reasons.push(`Rapide: ${contest.temps_estime} min`)
  }

  if (contest.type_participation === 'tirage') {
    reasons.push('Tirage simple (gratuit)')
  }

  if (iaAdjustment > 5) {
    reasons.push('Concours fiable (analyse IA positive)')
  } else if (iaAdjustment < -5) {
    reasons.push('⚠️ Conditions complexes détectées')
  }

  if (userAdjustment > 5 && contest.categorie_lot) {
    reasons.push(`Correspond à tes intérêts (${contest.categorie_lot})`)
  }

  if (userAdjustment < -15) {
    reasons.push('❌ Masqué par tes préférences')
  }

  return reasons.join(' • ')
}

// Calculate Final Score
export async function calculateFinalScore(
  contest: Contest,
  userSettings: UserSettings
): Promise<ContestScore> {
  // 1. Base score (rules)
  const baseScore = calculateBaseScore(contest)

  // 2. IA adjustment (LLM) - can be skipped for faster calculation
  let iaAdjustment = 0
  let iaAnalysis: IAAnalysis | null = null

  try {
    iaAnalysis = await getIAAdjustment(contest)
    iaAdjustment = iaAnalysis.adjustment
  } catch (error) {
    console.warn('IA adjustment failed, using base score only', error)
  }

  // 3. User preferences
  const userAdjustment = getUserPreferenceAdjustment(contest, userSettings)

  // 4. Weighted combination
  const rawScore =
    (baseScore * 0.5) +
    (iaAdjustment * 0.3) +
    (userAdjustment * 0.2)

  // 5. Normalize to 0-100
  const finalScore = Math.max(0, Math.min(100, rawScore))

  // 6. Generate reasoning
  const reasoning = generateReasoning({
    baseScore,
    iaAdjustment,
    userAdjustment,
    finalScore,
    contest
  })

  return {
    base_score: baseScore,
    ia_adjustment: iaAdjustment,
    user_adjustment: userAdjustment,
    final_score: finalScore,
    reasoning,
    timestamp: new Date()
  }
}

// Calculate scores for multiple contests (batch)
export async function scoreAllContests(
  contests: Contest[],
  userSettings: UserSettings
): Promise<Map<string, number>> {
  const scores = new Map<string, number>()

  // Process in batches to avoid overwhelming the LLM
  const BATCH_SIZE = 5

  for (let i = 0; i < contests.length; i += BATCH_SIZE) {
    const batch = contests.slice(i, i + BATCH_SIZE)

    const batchScores = await Promise.all(
      batch.map(c => calculateFinalScore(c, userSettings))
    )

    batch.forEach((contest, idx) => {
      scores.set(contest.id, batchScores[idx].final_score)
    })
  }

  return scores
}
