import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const statut = searchParams.get('statut')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('participations')
      .select(`
        *,
        contest:concours (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (statut && statut !== 'tous') {
      query = query.eq('statut', statut)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total: data?.length || 0,
      a_faire: data?.filter(p => p.statut === 'a_faire').length || 0,
      fait: data?.filter(p => p.statut === 'fait').length || 0,
      gagne: data?.filter(p => p.statut === 'gagne').length || 0,
      perdu: data?.filter(p => p.statut === 'perdu').length || 0,
      ignore: data?.filter(p => p.statut === 'ignore').length || 0
    }

    return NextResponse.json({
      participations: data || [],
      stats
    })
  } catch (error: any) {
    console.error('Error fetching participations:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { user_id, concours_id, statut, notes } = body

    if (!user_id || !concours_id) {
      return NextResponse.json(
        { error: 'user_id and concours_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('participations')
      .upsert({
        user_id,
        concours_id,
        statut: statut || 'a_faire',
        notes: notes || null,
        date_participation: statut === 'fait' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,concours_id'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating/updating participation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
