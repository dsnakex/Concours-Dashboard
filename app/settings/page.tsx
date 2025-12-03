'use client'

import { useState, useEffect } from 'react'
import { UserSettings, ParticipationType, LotCategory } from '@/types'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PARTICIPATION_TYPES: { value: ParticipationType; label: string }[] = [
  { value: 'direct', label: '🌐 Direct' },
  { value: 'quiz', label: '❓ Quiz' },
  { value: 'tirage', label: '🎲 Tirage' },
  { value: 'creativ', label: '🎨 Créatif' },
  { value: 'reseaux_sociaux', label: '👥 Réseaux sociaux' },
  { value: 'achat', label: '💳 Achat' },
]

const CATEGORIES: { value: LotCategory; label: string }[] = [
  { value: 'voyage', label: '✈️ Voyage' },
  { value: 'tech', label: '💻 Tech' },
  { value: 'argent', label: '💰 Argent' },
  { value: 'enfants', label: '👶 Enfants' },
  { value: 'autre', label: '📦 Autre' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
    fetchSettings(user)
  }

  const fetchSettings = async (userObj: any) => {
    const userId = userObj.id
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si pas de préférences, créer avec des valeurs par défaut
        if (error.code === 'PGRST116') {
          const defaultSettings: UserSettings = {
            id: userId,
            email: userObj.email || '',
            name: '',
            phone: '',
            types_participation_affichees: ['direct', 'quiz', 'tirage'] as ParticipationType[],
            types_participation_masquees: ['reseaux_sociaux', 'achat'] as ParticipationType[],
            categories_interessantes: [] as LotCategory[],
            langue: 'fr' as const,
            theme: 'light' as const,
            total_participations: 0,
            total_gagnes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert(defaultSettings)

          if (!insertError) {
            setSettings(defaultSettings)
          }
        }
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings || !user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          name: settings.name,
          phone: settings.phone,
          types_participation_masquees: settings.types_participation_masquees,
          categories_interessantes: settings.categories_interessantes,
          langue: settings.langue,
          theme: settings.theme,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggleMaskedType = (type: ParticipationType) => {
    if (!settings) return

    const masked = settings.types_participation_masquees || []
    const newMasked = masked.includes(type)
      ? masked.filter(t => t !== type)
      : [...masked, type]

    setSettings({ ...settings, types_participation_masquees: newMasked })
  }

  const toggleCategory = (category: LotCategory) => {
    if (!settings) return

    const interests = settings.categories_interessantes || []
    const newInterests = interests.includes(category)
      ? interests.filter(c => c !== category)
      : [...interests, category]

    setSettings({ ...settings, categories_interessantes: newInterests })
  }

  const handleExportData = async () => {
    alert('Fonctionnalité d\'export en cours de développement')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return
    }

    if (!confirm('Confirmer la suppression définitive ?')) {
      return
    }

    alert('Fonctionnalité de suppression de compte en cours de développement')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading || !settings) {
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
            <p className="text-sm text-text-secondary">Paramètres</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </a>
            <a href="/participations" className="text-sm hover:text-primary">
              Participations
            </a>
            <button onClick={handleLogout} className="btn btn-secondary text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-3xl font-bold mb-6">Paramètres du compte</h2>

        {/* Success message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Paramètres sauvegardés avec succès
          </div>
        )}

        {/* Profile section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Profil</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-control bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-text-secondary mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={settings.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="form-control"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="form-control"
                placeholder="+33 6 12 34 56 78"
              />
              <p className="text-xs text-text-secondary mt-1">
                Utile pour pré-remplir certains formulaires
              </p>
            </div>
          </div>
        </div>

        {/* Preferences section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Préférences de participation</h3>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2">
              Types de participation à masquer par défaut:
            </p>
            <div className="space-y-2">
              {PARTICIPATION_TYPES.map(type => (
                <label key={type.value} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.types_participation_masquees?.includes(type.value) || false}
                    onChange={() => toggleMaskedType(type.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Les types masqués ne seront pas affichés par défaut dans le dashboard
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              Catégories de lots qui vous intéressent:
            </p>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <label key={cat.value} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.categories_interessantes?.includes(cat.value) || false}
                    onChange={() => toggleCategory(cat.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Ces catégories recevront un bonus dans le scoring IA
            </p>
          </div>
        </div>

        {/* Display section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Affichage</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="langue" className="block text-sm font-medium mb-1">
                Langue
              </label>
              <select
                id="langue"
                value={settings.langue}
                onChange={(e) => setSettings({ ...settings, langue: e.target.value as 'fr' | 'en' })}
                className="form-control"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium mb-1">
                Thème
              </label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                className="form-control"
              >
                <option value="light">☀️ Clair</option>
                <option value="dark">🌙 Sombre</option>
                <option value="auto">🔄 Système</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Statistiques</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Total participations</p>
              <p className="text-2xl font-bold text-primary">{settings.total_participations}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total gains</p>
              <p className="text-2xl font-bold text-green-600">{settings.total_gagnes}</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-red-200 mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-4">Zone de danger</h3>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="btn btn-outline w-full justify-start"
            >
              📥 Exporter mes données (RGPD)
            </button>

            <button
              onClick={handleDeleteAccount}
              className="btn btn-outline w-full justify-start text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ Supprimer mon compte définitivement
            </button>
          </div>
        </div>

        {/* Save buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-secondary"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
