export interface ScraperConfig {
  name: string
  baseUrl: string
  enabled: boolean
  rateLimit: number // ms between requests
  userAgent: string
  parser: (html: string) => Promise<RawContest[]>
}

export interface RawContest {
  titre: string
  marque?: string
  description?: string
  lien_source: string
  date_fin?: string
  type_participation?: string
  categorie_lot?: string
  temps_estime?: number
  valeur_estimee?: number
  achat_obligatoire?: boolean
}

export interface ScraperResult {
  source: string
  imported: number
  duplicates: number
  errors: string[]
}
