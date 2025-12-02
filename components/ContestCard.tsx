'use client'

import { Contest, ParticipationStatus } from '@/types'

interface ContestCardProps {
  contest: Contest
  onMarkStatus?: (status: ParticipationStatus) => void
}

const ICONS: Record<string, string> = {
  direct: '🌐',
  reseaux_sociaux: '👥',
  quiz: '❓',
  creativ: '🎨',
  achat: '💳',
  tirage: '🎲'
}

export default function ContestCard({ contest, onMarkStatus }: ContestCardProps) {
  const scorePercentage = Math.round(contest.score_pertinence * 100)

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-text-primary">{contest.titre}</h3>
          {contest.marque && (
            <p className="text-sm text-text-secondary">{contest.marque}</p>
          )}
        </div>
        <span className="text-2xl">
          {ICONS[contest.type_participation] || '❓'}
        </span>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="badge badge-score">
          ⭐ {scorePercentage}%
        </span>
        {contest.temps_estime > 0 && (
          <span className="badge badge-time">
            ⏱️ {contest.temps_estime} min
          </span>
        )}
        {contest.valeur_estimee > 0 && (
          <span className="badge badge-value">
            💰 {contest.valeur_estimee}€
          </span>
        )}
        {contest.achat_obligatoire && (
          <span className="badge bg-red-100 text-red-800">
            💳 Achat requis
          </span>
        )}
      </div>

      {/* Conditions summary */}
      {contest.conditions_resumees && (
        <p className="text-xs text-gray-700 mt-3 line-clamp-2">
          {contest.conditions_resumees}
        </p>
      )}

      {/* Reasoning */}
      {contest.raison_score && (
        <p className="text-xs text-blue-600 mt-2">
          💡 {contest.raison_score}
        </p>
      )}

      {/* Date fin */}
      <p className="text-xs text-gray-500 mt-2">
        📅 Fin: {new Date(contest.date_fin).toLocaleDateString('fr-FR')}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <a
          href={contest.lien_source}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary flex-1 text-center"
        >
          Participer
        </a>

        {onMarkStatus && (
          <div className="relative group">
            <button className="btn btn-secondary">
              ⋮
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => onMarkStatus('a_faire')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                📌 À faire
              </button>
              <button
                onClick={() => onMarkStatus('fait')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ✅ Participé
              </button>
              <button
                onClick={() => onMarkStatus('gagne')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                🏆 Gagné
              </button>
              <button
                onClick={() => onMarkStatus('ignore')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ❌ Ignorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
