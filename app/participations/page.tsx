'use client'

import { useState, useEffect } from 'react'
import { Participation, ParticipationStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Stats {
  total: number
  a_faire: number
  fait: number
  gagne: number
  perdu: number
  ignore: number
}

const TAB_LABELS: Record<string, string> = {
  a_faire: 'À faire',
  fait: 'Participé',
  gagne: 'Gagné',
  tous: 'Tous'
}

const STATUS_BADGES: Record<ParticipationStatus, { color: string; label: string; icon: string }> = {
  a_faire: { color: 'bg-yellow-100 text-yellow-800', label: 'À faire', icon: '📌' },
  fait: { color: 'bg-blue-100 text-blue-800', label: 'Participé', icon: '✅' },
  gagne: { color: 'bg-green-100 text-green-800', label: 'Gagné', icon: '🏆' },
  perdu: { color: 'bg-gray-100 text-gray-800', label: 'Perdu', icon: '😔' },
  ignore: { color: 'bg-red-100 text-red-800', label: 'Ignoré', icon: '❌' }
}

export default function ParticipationsPage() {
  const [activeTab, setActiveTab] = useState<'a_faire' | 'fait' | 'gagne' | 'tous'>('a_faire')
  const [participations, setParticipations] = useState<Participation[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    a_faire: 0,
    fait: 0,
    gagne: 0,
    perdu: 0,
    ignore: 0
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

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

  useEffect(() => {
    if (user) {
      fetchParticipations()
      fetchStats()
    }
  }, [activeTab, user])

  const fetchParticipations = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('participations')
        .select(`
          *,
          contest:concours (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (activeTab !== 'tous') {
        query = query.eq('statut', activeTab)
      }

      const { data, error } = await query

      if (error) throw error

      setParticipations(data || [])
    } catch (error) {
      console.error('Error fetching participations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('participations')
        .select('statut')
        .eq('user_id', user.id)

      if (error) throw error

      const newStats: Stats = {
        total: data?.length || 0,
        a_faire: 0,
        fait: 0,
        gagne: 0,
        perdu: 0,
        ignore: 0
      }

      data?.forEach(p => {
        if (p.statut in newStats) {
          newStats[p.statut as keyof Stats]++
        }
      })

      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpdateStatus = async (participationId: string, newStatus: ParticipationStatus) => {
    try {
      const { error } = await supabase
        .from('participations')
        .update({
          statut: newStatus,
          date_participation: newStatus === 'fait' ? new Date().toISOString() : null
        })
        .eq('id', participationId)

      if (error) throw error

      fetchParticipations()
      fetchStats()
    } catch (error) {
      console.error('Error updating participation:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (participationId: string) => {
    if (!confirm('Supprimer cette participation ?')) return

    try {
      const { error } = await supabase
        .from('participations')
        .delete()
        .eq('id', participationId)

      if (error) throw error

      fetchParticipations()
      fetchStats()
    } catch (error) {
      console.error('Error deleting participation:', error)
      alert('Erreur lors de la suppression')
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
            <p className="text-sm text-text-secondary">Mes participations</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </a>
            <a href="/settings" className="text-sm hover:text-primary">
              Paramètres
            </a>
            <button onClick={handleLogout} className="btn btn-secondary text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-3xl font-bold mb-6">Historique des participations</h2>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-text-secondary">Total</p>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary">À faire</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.a_faire}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary">Participé</p>
            <p className="text-3xl font-bold text-blue-600">{stats.fait}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-secondary">Gagné</p>
            <p className="text-3xl font-bold text-green-600">{stats.gagne}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
          {(['a_faire', 'fait', 'gagne', 'tous'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              {TAB_LABELS[tab]}
              {tab !== 'tous' && stats[tab] > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                  {stats[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && participations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary mb-2">
              Aucune participation pour le moment
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Marquez des concours depuis le dashboard pour les retrouver ici
            </p>
            <a href="/dashboard" className="btn btn-primary">
              Voir les concours
            </a>
          </div>
        )}

        {/* Participations list */}
        {!loading && participations.length > 0 && (
          <div className="space-y-3">
            {participations.map(participation => (
              <div
                key={participation.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {participation.contest?.titre || 'Concours supprimé'}
                    </h3>
                    {participation.contest?.marque && (
                      <p className="text-sm text-text-secondary">
                        {participation.contest.marque}
                      </p>
                    )}
                    {participation.notes && (
                      <p className="text-xs text-blue-600 mt-2">
                        📝 {participation.notes}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 text-xs text-text-secondary">
                      <span>
                        Ajouté le {new Date(participation.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {participation.date_participation && (
                        <span>
                          • Participé le {new Date(participation.date_participation).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <span className={`badge ${STATUS_BADGES[participation.statut].color}`}>
                      {STATUS_BADGES[participation.statut].icon} {STATUS_BADGES[participation.statut].label}
                    </span>

                    <div className="flex gap-2">
                      {participation.contest && (
                        <a
                          href={participation.contest.lien_source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Voir le concours
                        </a>
                      )}

                      <div className="relative group">
                        <button className="text-xs text-text-secondary hover:text-primary">
                          ⋮
                        </button>
                        <div className="hidden group-hover:block absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          {participation.statut !== 'fait' && (
                            <button
                              onClick={() => handleUpdateStatus(participation.id, 'fait')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              ✅ Marquer participé
                            </button>
                          )}
                          {participation.statut !== 'gagne' && (
                            <button
                              onClick={() => handleUpdateStatus(participation.id, 'gagne')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              🏆 Marquer gagné
                            </button>
                          )}
                          {participation.statut !== 'a_faire' && (
                            <button
                              onClick={() => handleUpdateStatus(participation.id, 'a_faire')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              📌 Remettre à faire
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(participation.id)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
