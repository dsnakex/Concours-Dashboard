'use client'

import { useState, useEffect } from 'react'
import { Contest, FilterState, ParticipationStatus } from '@/types'
import ContestCard from '@/components/ContestCard'
import FilterSidebar from '@/components/FilterSidebar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  types: [],
  categories: [],
  hideReseauxSociaux: true,
  hideAchat: true,
  sortBy: 'score'
}

export default function DashboardPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)
  }

  // Fetch contests
  useEffect(() => {
    if (user) {
      fetchContests()
    }
  }, [filters, user])

  const fetchContests = async () => {
    setLoading(true)

    try {
      let query = supabase
        .from('concours')
        .select('*')
        .eq('statut', 'actif')
        .gte('date_fin', new Date().toISOString())

      // Apply filters
      if (filters.hideReseauxSociaux) {
        query = query.neq('type_participation', 'reseaux_sociaux')
      }

      if (filters.hideAchat) {
        query = query.eq('achat_obligatoire', false)
      }

      if (filters.types.length > 0) {
        query = query.in('type_participation', filters.types)
      }

      if (filters.categories.length > 0) {
        query = query.in('categorie_lot', filters.categories)
      }

      if (filters.search) {
        query = query.or(`titre.ilike.%${filters.search}%,marque.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sortBy) {
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

      const { data, error } = await query.limit(50)

      if (error) throw error

      setContests(data || [])
    } catch (error) {
      console.error('Error fetching contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkStatus = async (contestId: string, status: ParticipationStatus) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('participations')
        .upsert({
          user_id: user.id,
          concours_id: contestId,
          statut: status,
          date_participation: status === 'fait' ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,concours_id'
        })

      if (error) throw error

      // Show success message
      alert(`Concours marqué comme "${status}"`)
    } catch (error) {
      console.error('Error marking status:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Contest AI</h1>
            <p className="text-sm text-text-secondary">Dashboard de jeux-concours</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/participations" className="text-sm hover:text-primary">
              Participations
            </a>
            <a href="/settings" className="text-sm hover:text-primary">
              Paramètres
            </a>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Mes Concours</h2>
                <p className="text-text-secondary mt-1">
                  {loading ? 'Chargement...' : `${contests.length} concours correspondants`}
                </p>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden btn btn-primary"
              >
                Filtres
              </button>
            </div>

            {/* Mobile filters */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <FilterSidebar filters={filters} onFilterChange={setFilters} />
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Empty state */}
            {!loading && contests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-text-secondary">
                  Aucun concours ne correspond à vos critères
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}

            {/* Contests grid */}
            {!loading && contests.length > 0 && (
              <div className="space-y-4">
                {contests.map((contest) => (
                  <ContestCard
                    key={contest.id}
                    contest={contest}
                    onMarkStatus={(status) => handleMarkStatus(contest.id, status)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
