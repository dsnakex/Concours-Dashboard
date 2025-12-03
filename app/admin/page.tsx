'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du scraping')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGetScrapers = async () => {
    try {
      const response = await fetch('/api/admin/ingest')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Administration - Scraping
        </h1>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>

          <div className="flex gap-4">
            <button
              onClick={handleScrape}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scraping en cours...
                </span>
              ) : (
                '🔄 Lancer le Scraping'
              )}
            </button>

            <button
              onClick={handleGetScrapers}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              📋 Voir les Scrapers
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats</h2>

            {result.totals && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    {result.totals.imported}
                  </div>
                  <div className="text-sm text-green-800">Importés</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.totals.duplicates}
                  </div>
                  <div className="text-sm text-yellow-800">Doublons</div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-600">
                    {result.totals.errors?.length || 0}
                  </div>
                  <div className="text-sm text-red-800">Erreurs</div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            {result.results && (
              <div className="space-y-4">
                {result.results.map((r: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      Source: {r.source}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Importés:</span>{' '}
                        <span className="font-semibold">{r.imported}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Doublons:</span>{' '}
                        <span className="font-semibold">{r.duplicates}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Erreurs:</span>{' '}
                        <span className="font-semibold">{r.errors.length}</span>
                      </div>
                    </div>
                    {r.errors.length > 0 && (
                      <div className="mt-3 bg-red-50 rounded p-3">
                        <div className="text-sm text-red-800 font-semibold mb-1">
                          Erreurs:
                        </div>
                        <ul className="text-xs text-red-700 space-y-1">
                          {r.errors.map((err: string, i: number) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Scrapers List */}
            {result.scrapers && (
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Scrapers Disponibles</h3>
                {result.scrapers.map((scraper: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{scraper.name}</div>
                      <div className="text-sm text-gray-600">{scraper.baseUrl}</div>
                    </div>
                    <div>
                      {scraper.enabled ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          ✓ Actif
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          ✗ Inactif
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Voir le JSON complet
              </summary>
              <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Le scraping est automatique tous les jours à 8h00 (UTC)</li>
            <li>• Vous pouvez aussi le déclencher manuellement ici</li>
            <li>• Les doublons sont détectés automatiquement via le lien source</li>
            <li>• Les erreurs n'arrêtent pas le processus complet</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
