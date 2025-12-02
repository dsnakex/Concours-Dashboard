import { NextRequest, NextResponse } from 'next/server'
import { scrapeAllSources, scrapeSource, SCRAPERS } from '@/lib/scrapers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source } = body

    let results

    if (source) {
      // Scrape specific source
      const scraper = SCRAPERS.find(s => s.name === source)

      if (!scraper) {
        return NextResponse.json(
          { error: `Source "${source}" not found` },
          { status: 404 }
        )
      }

      const result = await scrapeSource(scraper)
      results = [result]
    } else {
      // Scrape all sources
      results = await scrapeAllSources()
    }

    // Calculate totals
    const totals = results.reduce(
      (acc, result) => ({
        imported: acc.imported + result.imported,
        duplicates: acc.duplicates + result.duplicates,
        errors: [...acc.errors, ...result.errors]
      }),
      { imported: 0, duplicates: 0, errors: [] as string[] }
    )

    // Log to database
    const { error: logError } = await (await import('@/lib/supabase')).supabase
      .from('ingest_logs')
      .insert({
        imported: totals.imported,
        duplicates: totals.duplicates,
        errors: totals.errors,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: totals.errors.length === 0 ? 'success' : 'partial'
      })

    if (logError) {
      console.error('Failed to log ingestion:', logError)
    }

    return NextResponse.json({
      success: true,
      results,
      totals
    })
  } catch (error: any) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return list of available scrapers
    return NextResponse.json({
      scrapers: SCRAPERS.map(s => ({
        name: s.name,
        baseUrl: s.baseUrl,
        enabled: s.enabled
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
