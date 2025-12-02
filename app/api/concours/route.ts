import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const skip = Number(searchParams.get('skip')) || 0
    const limit = Number(searchParams.get('limit')) || 20
    const sort = searchParams.get('sort') || 'score'
    const types = searchParams.get('types')?.split(',').filter(Boolean)
    const categories = searchParams.get('categories')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const hideReseauxSociaux = searchParams.get('hideReseauxSociaux') === 'true'
    const hideAchat = searchParams.get('hideAchat') === 'true'

    let query = supabase
      .from('concours')
      .select('*', { count: 'exact' })
      .eq('statut', 'actif')
      .gte('date_fin', new Date().toISOString())

    // Apply filters
    if (hideReseauxSociaux) {
      query = query.neq('type_participation', 'reseaux_sociaux')
    }

    if (hideAchat) {
      query = query.eq('achat_obligatoire', false)
    }

    if (types && types.length > 0) {
      query = query.in('type_participation', types)
    }

    if (categories && categories.length > 0) {
      query = query.in('categorie_lot', categories)
    }

    if (search) {
      query = query.or(`titre.ilike.%${search}%,marque.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sort) {
      case 'score':
        query = query.order('score_pertinence', { ascending: false })
        break
      case 'date_fin':
        query = query.order('date_fin', { ascending: false })
        break
      case 'temps':
        query = query.order('temps_estime', { ascending: true })
        break
      case 'valeur':
        query = query.order('valeur_estimee', { ascending: false })
        break
    }

    query = query.range(skip, skip + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      contests: data || [],
      total: count || 0,
      hasMore: (count || 0) > skip + limit
    })
  } catch (error: any) {
    console.error('Error fetching contests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabase
      .from('concours')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating contest:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
