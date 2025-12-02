# IA Scoring Engine & Logic - Contest AI Platform

## 1. Scoring Algorithm (Hybrid: Rules + LLM)

### Overview
```
Score Final = (BaseScore × 0.5) + (IAAdjustment × 0.3) + (UserPreferences × 0.2)
Result: 0-100 (displayed as %)
```

---

## 2. Base Score (Rules-Based, 0-50 points)

### 2.1 Value Component (0-10 points)
```typescript
function scoreValue(valeur_estimee: number, nombre_lots: number): number {
  const totalValue = valeur_estimee * nombre_lots;
  
  // Calibration: Ajuste si tu as d'autres données
  const maxValue = 10000; // Au-delà: considéré comme max
  
  if (totalValue <= 100) return 1;      // Petit lot
  if (totalValue <= 500) return 3;      // Moyen
  if (totalValue <= 1000) return 6;     // Bon
  if (totalValue <= 2000) return 8;     // Très bon
  return 10;                             // Excellent
}
```

### 2.2 Effort Component (0-10 points, inversé)
```typescript
function scoreEffort(temps_estime: number): number {
  // Plus c'est rapide, plus c'est intéressant
  // Max points si < 5 minutes, moins si > 1h
  
  if (temps_estime <= 5) return 10;
  if (temps_estime <= 15) return 8;
  if (temps_estime <= 30) return 6;
  if (temps_estime <= 60) return 3;
  return 1; // > 1h: peu intéressant
}
```

### 2.3 Mechanics Bonus (0-15 points)
```typescript
function scoreMechanics(type_participation: string, achat_obligatoire: boolean): number {
  let score = 0;
  
  // Type participation bonus
  const mechanicsBonus = {
    'tirage': 15,           // ⭐ Très facile, gratuit
    'direct': 12,           // ⭐ Simple formulaire
    'quiz': 8,              // Moyen: require connaissance
    'creativ': 5,           // Complexe: faut créer
    'reseaux_sociaux': 6,   // Moyen: depend du site
    'achat': -20            // 🔴 Négatif: faut payer
  };
  
  score = mechanicsBonus[type_participation] || 0;
  
  // Bonus/penalty achat
  if (achat_obligatoire) {
    score -= 10; // Very negative for required purchases
  }
  
  return Math.max(0, score);
}
```

### 2.4 Popularity Component (0-15 points)
```typescript
function scorePopularity(
  clicks_count: number,
  comments_count: number,
  days_active: number
): number {
  // Basé sur engagement: si bcp de clics/comments, prob légitime & populaire
  
  const clicksPerDay = clicks_count / Math.max(days_active, 1);
  const totalEngagement = (clicksPerDay * 0.7) + (comments_count * 0.3);
  
  if (totalEngagement > 100) return 15;  // Very popular
  if (totalEngagement > 50) return 12;
  if (totalEngagement > 20) return 8;
  if (totalEngagement > 5) return 4;
  return 0;
}
```

### 2.5 Legitimacy Check (0-10 points)
```typescript
function scoreLegitimacy(
  source: string,
  description_length: number,
  has_conditions: boolean
): number {
  // Détecte concours spam/fake
  
  let score = 10; // Par défaut, légitime
  
  // Sources douteuses
  const doubfulSources = ['unknown', 'manual_unverified'];
  if (doubfulSources.includes(source)) score -= 8;
  
  // Descriptions trop courtes (< 50 chars) = probablement fake
  if (description_length < 50) score -= 5;
  
  // Pas de conditions détaillées = suspect
  if (!has_conditions) score -= 3;
  
  return Math.max(0, score);
}
```

### Base Score Calculation
```typescript
function calculateBaseScore(contest: Contest): number {
  const value = scoreValue(contest.valeur_estimee, contest.nombre_lots);
  const effort = scoreEffort(contest.temps_estime);
  const mechanics = scoreMechanics(contest.type_participation, contest.achat_obligatoire);
  const popularity = scorePopularity(
    contest.clicks_count || 0,
    contest.comments_count || 0,
    daysSinceCreation(contest.date_ajout)
  );
  const legitimacy = scoreLegitimacy(
    contest.source,
    contest.description.length,
    !!contest.conditions_resumees
  );
  
  const baseScore = value + effort + mechanics + popularity + legitimacy;
  
  // Normalize to 0-50
  return Math.min(50, baseScore);
}
```

---

## 3. IA Adjustment (LLM, -30 to +30 adjustment)

### 3.1 When to Use LLM
```
- Score description (if available)
- Detect hidden catches/complexity
- Assess legitimacy
- Estimate true value
```

### 3.2 LLM Prompt
```
Analyze this contest for legitimacy and actual value:

Title: "{contest.titre}"
Description: "{contest.description}"
Type: {contest.type_participation}
Value Estimate: {contest.valeur_estimee}€
Estimated Time: {contest.temps_estime} mins
Conditions: "{contest.conditions_resumees}"

Score this contest on:
1. Legitimacy (0-10): Is this a real, trustworthy contest?
2. Clarity (0-10): Are conditions clear and not misleading?
3. Hidden Catches (0-10): Any hidden requirements or complexity?
4. True Value (0-10): Is the estimated value accurate?

Return ONLY JSON:
{
  "legitimacy": 8,
  "clarity": 7,
  "hidden_catches": 3,
  "true_value": 9,
  "adjustment": -5,
  "explanation": "Real contest but conditions somewhat complex"
}

Scale:
- Adjustment -30: Major red flags
- Adjustment -10: Some concerns
- Adjustment 0: Neutral
- Adjustment +10: Looks good
- Adjustment +30: Excellent opportunity
```

### 3.3 IA Adjustment Implementation
```typescript
async function getIAAdjustment(contest: Contest): Promise<IAAnalysis> {
  // Skip if description too short
  if ((contest.description || '').length < 30) {
    return { adjustment: 0, explanation: 'Insufficient data' };
  }
  
  const prompt = `... (as above) ...`;
  
  try {
    // Use Ollama local or Claude API
    const response = await llmCall(prompt, {
      model: 'llama2:7b', // ou 'claude-3.5-sonnet'
      temperature: 0, // Deterministic
      max_tokens: 200,
      timeout_ms: 5000
    });
    
    const analysis = JSON.parse(response);
    
    // Validate response
    if (!isValidAnalysis(analysis)) {
      return { adjustment: 0, explanation: 'Invalid response' };
    }
    
    return {
      adjustment: analysis.adjustment,
      explanation: analysis.explanation,
      scores: {
        legitimacy: analysis.legitimacy,
        clarity: analysis.clarity,
        hidden_catches: analysis.hidden_catches,
        true_value: analysis.true_value
      }
    };
    
  } catch (error) {
    console.warn('LLM call failed:', error);
    return { adjustment: 0, explanation: 'LLM unavailable' };
  }
}
```

---

## 4. User Preferences Adjustment (0-20 points)

### 4.1 Personalization Logic
```typescript
function getUserPreferenceAdjustment(
  contest: Contest,
  userSettings: UserSettings
): number {
  let adjustment = 0;
  
  // Match user interests
  if (userSettings.categories_interessantes?.includes(contest.categorie_lot)) {
    adjustment += 10;
  }
  
  // Match participation type preferences
  if (
    contest.type_participation &&
    !userSettings.types_participation_masquees?.includes(contest.type_participation)
  ) {
    adjustment += 5;
  }
  
  // Penalty for masked types
  if (userSettings.types_participation_masquees?.includes(contest.type_participation)) {
    adjustment -= 20; // Strong penalty: user explicitly masked this
  }
  
  // Bonus for quick participations (if user has limited time)
  if (contest.temps_estime <= 10 && userSettings.prefer_quick) {
    adjustment += 5;
  }
  
  return Math.max(-20, Math.min(20, adjustment)); // Clamp -20 to +20
}
```

---

## 5. Final Score Calculation

```typescript
interface ContestScore {
  base_score: number;       // 0-50
  ia_adjustment: number;    // -30 to +30
  user_adjustment: number;  // -20 to +20
  final_score: number;      // 0-100
  reasoning: string;
  timestamp: Date;
}

async function calculateFinalScore(
  contest: Contest,
  userSettings: UserSettings
): Promise<ContestScore> {
  
  // 1. Base score (règles)
  const baseScore = calculateBaseScore(contest);
  
  // 2. IA adjustment (LLM)
  const iaAnalysis = await getIAAdjustment(contest);
  const iaAdjustment = iaAnalysis.adjustment;
  
  // 3. User preferences
  const userAdjustment = getUserPreferenceAdjustment(contest, userSettings);
  
  // 4. Weighted combination
  const rawScore = 
    (baseScore * 0.5) + 
    (iaAdjustment * 0.3) + 
    (userAdjustment * 0.2);
  
  // 5. Normalize to 0-100
  const finalScore = Math.max(0, Math.min(100, rawScore));
  
  // 6. Generate reasoning
  const reasoning = generateReasoning({
    baseScore,
    iaAdjustment,
    userAdjustment,
    finalScore,
    contest
  });
  
  return {
    base_score: baseScore,
    ia_adjustment: iaAdjustment,
    user_adjustment: userAdjustment,
    final_score: finalScore,
    reasoning,
    timestamp: new Date()
  };
}
```

---

## 6. Reasoning Generation (User-Friendly)

```typescript
function generateReasoning(scoreData: {
  baseScore: number;
  iaAdjustment: number;
  userAdjustment: number;
  finalScore: number;
  contest: Contest;
}): string {
  const { contest, finalScore, iaAdjustment, userAdjustment } = scoreData;
  
  const reasons: string[] = [];
  
  // Base score reasons
  if (contest.valeur_estimee > 1000) {
    reasons.push(`Lot intéressant: ${contest.valeur_estimee}€`);
  }
  
  if (contest.temps_estime <= 15) {
    reasons.push(`Rapide: ${contest.temps_estime} min`);
  }
  
  if (contest.type_participation === 'tirage') {
    reasons.push('Tirage simple (gratuit)');
  }
  
  // IA reasons
  if (iaAdjustment > 5) {
    reasons.push('Concours fiable (analyse IA positive)');
  } else if (iaAdjustment < -5) {
    reasons.push('⚠️ Conditions complexes détectées');
  }
  
  // User preference reasons
  if (userAdjustment > 5 && contest.categorie_lot) {
    reasons.push(`Correspond tes intérêts (${contest.categorie_lot})`);
  }
  
  if (userAdjustment < -15) {
    reasons.push('❌ Masqué par tes préférences (réseaux sociaux/achat)');
  }
  
  return reasons.join(' • ');
}
```

---

## 7. Conditions Summarization (LLM)

### Prompt
```
Summarize these contest conditions in 1-2 sentences maximum.
Include ONLY critical info: eligibility, purchase requirement, deadline.

Full conditions:
"{full_text}"

Return JSON:
{
  "summary": "Gratuit, France 18+, Follow Instagram",
  "achat_obligatoire": false,
  "pays_eligibles": ["FR"],
  "age_min": 18
}
```

### Implementation
```typescript
async function summarizeConditions(contest: Contest): Promise<ConditionsSummary> {
  if (!contest.description) {
    return {
      summary: 'Conditions non disponibles',
      achat_obligatoire: false,
      pays_eligibles: ['FR'],
      age_min: null
    };
  }
  
  const prompt = `... (as above) ...`;
  
  try {
    const response = await llmCall(prompt, {
      model: 'llama2:7b',
      temperature: 0,
      max_tokens: 100
    });
    
    const result = JSON.parse(response);
    
    return {
      summary: result.summary || 'Voir conditions complètes',
      achat_obligatoire: result.achat_obligatoire || false,
      pays_eligibles: result.pays_eligibles || ['FR'],
      age_min: result.age_min
    };
    
  } catch (error) {
    console.warn('Summarization failed:', error);
    return {
      summary: contest.description.substring(0, 100) + '...',
      achat_obligatoire: contest.achat_obligatoire || false,
      pays_eligibles: contest.pays_eligibles || ['FR'],
      age_min: contest.age_min
    };
  }
}
```

---

## 8. Caching Strategy

```typescript
// Cache scores for 24 hours (recalculate if conditions change)
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// Store in database
interface ContestScoreCache {
  concours_id: UUID;
  user_id: UUID;
  score: ContestScore;
  calculated_at: Date;
  valid_until: Date;
}

async function getOrCalculateScore(
  contest: Contest,
  userSettings: UserSettings
): Promise<ContestScore> {
  
  const cacheKey = `score:${contest.id}:${userSettings.id}`;
  
  // Check cache
  const cached = await getFromCache(cacheKey);
  if (cached && !isCacheExpired(cached)) {
    return cached.score;
  }
  
  // Calculate fresh
  const score = await calculateFinalScore(contest, userSettings);
  
  // Cache it
  await setCache(cacheKey, score, CACHE_DURATION_MS);
  
  return score;
}
```

---

## 9. Batch Scoring (for dashboard load)

```typescript
async function scoreAllContests(
  contests: Contest[],
  userSettings: UserSettings
): Promise<Map<string, number>> {
  
  const scores = new Map<string, number>();
  
  // Process in parallel (max 5 concurrent LLM calls)
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < contests.length; i += BATCH_SIZE) {
    const batch = contests.slice(i, i + BATCH_SIZE);
    
    const batchScores = await Promise.all(
      batch.map(c => getOrCalculateScore(c, userSettings))
    );
    
    batch.forEach((contest, idx) => {
      scores.set(contest.id, batchScores[idx].final_score);
    });
  }
  
  return scores;
}
```

---

## 10. Monitoring & Iteration

### Track metrics:
```typescript
interface ScoringMetrics {
  avg_score: number;
  score_distribution: { bin: string, count: number }[];
  user_clicks_by_score: { score_range: string, clicks: number }[];
  cache_hit_rate: number;
  avg_calculation_time_ms: number;
  ia_adjustment_distribution: { bucket: string, count: number }[];
}
```

### Use to improve:
- If users never click low scores → lower thresholds
- If high scores have low click rate → recalibrate IA
- If calculation slow → increase cache duration
- If LLM failures high → fallback rules-only mode

---

## 11. Configuration Constants

```typescript
// Adjust these based on real data after Phase 1
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
  LLM_MODEL: 'llama2:7b' // ou 'claude-3.5-sonnet'
};
```
