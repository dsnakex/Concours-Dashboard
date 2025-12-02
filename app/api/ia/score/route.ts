import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateFinalScore } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { concours_id, user_id } = body

    if (!concours_id || !user_id) {
      return NextResponse.json(
        { error: 'concours_id and user_id are required' },
        { status: 400 }
      )
    }

    // Fetch contest
    const { data: contest, error: contestError } = await supabase
      .from('concours')
      .select('*')
      .eq('id', concours_id)
      .single()

    if (contestError || !contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      )
    }

    // Fetch user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', user_id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'User settings not found' },
        { status: 404 }
      )
    }

    // Calculate score
    const startTime = Date.now()
    const scoreResult = await calculateFinalScore(contest, settings)
    const duration = Date.now() - startTime

    // Update contest with new score
    await supabase
      .from('concours')
      .update({
        score_pertinence: scoreResult.final_score / 100,
        raison_score: scoreResult.reasoning
      })
      .eq('id', concours_id)

    return NextResponse.json({
      score: scoreResult.final_score,
      raison: scoreResult.reasoning,
      base_score: scoreResult.base_score,
      ia_adjustment: scoreResult.ia_adjustment,
      user_adjustment: scoreResult.user_adjustment,
      duration_ms: duration
    })
  } catch (error: any) {
    console.error('Error calculating score:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
