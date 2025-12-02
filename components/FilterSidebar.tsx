'use client'

import { FilterState, ParticipationType, LotCategory } from '@/types'

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

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

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search })
  }

  const handleToggleType = (type: ParticipationType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    onFilterChange({ ...filters, types })
  }

  const handleToggleCategory = (category: LotCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    onFilterChange({ ...filters, categories })
  }

  const handleReset = () => {
    onFilterChange({
      search: '',
      types: [],
      categories: [],
      hideReseauxSociaux: true,
      hideAchat: true,
      sortBy: 'score'
    })
  }

  return (
    <aside className="w-full lg:w-64 bg-surface rounded-lg border border-border p-4 sticky top-4 h-fit">
      <h2 className="font-bold text-lg mb-4">Filtres</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="form-control text-sm"
        />
      </div>

      {/* Quick toggles */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hideReseauxSociaux}
            onChange={(e) => onFilterChange({
              ...filters,
              hideReseauxSociaux: e.target.checked
            })}
            className="mr-2"
          />
          <span className="text-sm">Masquer réseaux sociaux</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hideAchat}
            onChange={(e) => onFilterChange({
              ...filters,
              hideAchat: e.target.checked
            })}
            className="mr-2"
          />
          <span className="text-sm">Masquer achats obligatoires</span>
        </label>
      </div>

      {/* Type participation */}
      <div className="mb-4 pb-4 border-b border-border">
        <label className="text-sm font-semibold block mb-2">Type de participation</label>
        <div className="space-y-1">
          {PARTICIPATION_TYPES.map(type => (
            <label key={type.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => handleToggleType(type.value)}
                className="mr-2"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4 pb-4 border-b border-border">
        <label className="text-sm font-semibold block mb-2">Catégorie du lot</label>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.value)}
                onChange={() => handleToggleCategory(cat.value)}
                className="mr-2"
              />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="text-sm font-semibold block mb-2">Trier par</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({
            ...filters,
            sortBy: e.target.value as any
          })}
          className="form-control text-sm"
        >
          <option value="score">Score pertinence ↓</option>
          <option value="date_fin">Date fin ↓</option>
          <option value="temps">Temps estimé ↑</option>
          <option value="valeur">Valeur lot ↓</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="btn btn-secondary w-full text-sm"
      >
        Réinitialiser
      </button>
    </aside>
  )
}
