# UI/UX Components & Design Specs

## 1. Design System Overview

### Color Palette
```
Primary: #2180A0 (Teal) - Actions, highlights
Secondary: #5E5240 (Brown) - Accents, borders
Danger: #C01527 (Red) - Warnings, destructive
Success: #21808D (Teal-green) - Confirmations
Warning: #A84B2F (Orange) - Alerts

Neutral:
- Background: #FCFCF9 (Cream)
- Surface: #FFFFF5
- Text Primary: #134252 (Dark teal)
- Text Secondary: #62717F (Slate)
- Border: #E8E8E8 (Light gray)
```

### Typography
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
          (System fonts for performance)

Sizes:
- H1: 30px (bold) - Page titles
- H2: 24px (semibold) - Section titles
- H3: 18px (semibold) - Subsections
- Body: 14px (regular) - Main content
- Small: 12px (regular) - Metadata, secondary
- Mono: "Courier New" - Codes

Line Height: 1.5 (body), 1.2 (headings)
Letter Spacing: -0.01em (headings)
```

### Spacing
```
Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px
Component gaps: 16px (default)
Page padding: 20px (mobile), 32px (desktop)
```

### Border Radius
```
Small: 6px - inputs, small buttons
Medium: 8px - cards, dialogs
Large: 12px - containers
Full: 9999px - badges, avatars
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
```

---

## 2. Key Components

### 2.1 Contest Card

```tsx
interface ContestCardProps {
  contest: Contest;
  onMarkStatus?: (status: ParticipationStatus) => void;
}

export function ContestCard({ contest, onMarkStatus }: ContestCardProps) {
  const ICONS = {
    direct: '🌐',
    reseaux_sociaux: '👥',
    quiz: '❓',
    creativ: '🎨',
    achat: '💳',
    tirage: '🎲'
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-bold text-lg">{contest.titre}</h3>
          <p className="text-sm text-gray-600">{contest.marque}</p>
        </div>
        <span className="text-2xl">
          {ICONS[contest.type_participation] || '❓'}
        </span>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        <Badge variant="score">
          ⭐ {Math.round(contest.score_pertinence * 100)}%
        </Badge>
        <Badge variant="time">
          ⏱️ {contest.temps_estime} min
        </Badge>
        <Badge variant="value">
          💰 {contest.valeur_estimee}€
        </Badge>
      </div>

      {/* Conditions summary */}
      <p className="text-xs text-gray-700 mt-3 line-clamp-2">
        {contest.conditions_resumees}
      </p>

      {/* Reasoning */}
      <p className="text-xs text-blue-600 mt-2">
        💡 {contest.raison_score}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <a 
          href={contest.lien_source}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary flex-1"
        >
          Participer
        </a>
        <Menu>
          <MenuItem onClick={() => onMarkStatus('fait')}>
            ✅ Participé
          </MenuItem>
          <MenuItem onClick={() => onMarkStatus('gagne')}>
            🏆 Gagné
          </MenuItem>
          <MenuItem onClick={() => onMarkStatus('ignore')}>
            ❌ Ignorer
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
```

### 2.2 Filter Sidebar

```tsx
interface FilterState {
  search: string;
  types: string[];
  categories: string[];
  hideReseauxSociaux: boolean;
  hideAchat: boolean;
  sortBy: 'score' | 'date_fin' | 'temps' | 'valeur';
}

export function FilterSidebar({ 
  filters, 
  onFilterChange 
}: { 
  filters: FilterState; 
  onFilterChange: (f: FilterState) => void;
}) {
  return (
    <aside className="w-64 bg-white rounded-lg border p-4 sticky top-4 h-fit">
      <h2 className="font-bold mb-4">Filtres</h2>

      {/* Search */}
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => onFilterChange({
            ...filters,
            search: e.target.value
          })}
          className="form-control"
        />
      </div>

      {/* Quick toggles */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.hideReseauxSociaux}
            onChange={(e) => onFilterChange({
              ...filters,
              hideReseauxSociaux: e.target.checked
            })}
          />
          <span className="ml-2 text-sm">Masquer réseaux sociaux 👥</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.hideAchat}
            onChange={(e) => onFilterChange({
              ...filters,
              hideAchat: e.target.checked
            })}
          />
          <span className="ml-2 text-sm">Masquer achats obligatoires 💳</span>
        </label>
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Type participation */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Type de participation</label>
        <div className="space-y-1 mt-2">
          {['direct', 'quiz', 'tirage', 'creativ', 'reseaux_sociaux'].map(t => (
            <label key={t} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={filters.types.includes(t)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...filters.types, t]
                    : filters.types.filter(x => x !== t);
                  onFilterChange({ ...filters, types: updated });
                }}
              />
              <span className="ml-2">{capitalize(t)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Trier par</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({
            ...filters,
            sortBy: e.target.value as any
          })}
          className="form-control mt-1"
        >
          <option value="score">Score pertinence ↓</option>
          <option value="date_fin">Date fin ↓</option>
          <option value="temps">Temps estimé ↑</option>
          <option value="valeur">Valeur lot ↓</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onFilterChange(DEFAULT_FILTERS)}
        className="btn btn-secondary w-full"
      >
        Réinitialiser
      </button>
    </aside>
  );
}
```

### 2.3 Dashboard Main Layout

```tsx
export function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests(filters).then(data => {
      setContests(data);
      setLoading(false);
    });
  }, [filters]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
      {/* Sidebar (collapsible on mobile) */}
      <div className="hidden lg:block">
        <FilterSidebar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Main content */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mes Concours</h1>
          <p className="text-gray-600 mt-1">
            {contests.length} concours correspondants
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <FilterButton onClick={() => setShowMobileFilters(!showMobileFilters)} />
          {showMobileFilters && (
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          )}
        </div>

        {/* Contests grid */}
        {contests.length === 0 ? (
          <EmptyState message="Aucun concours ne correspond à vos critères" />
        ) : (
          <div className="space-y-4">
            {contests.map(c => (
              <ContestCard key={c.id} contest={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2.4 Participations History

```tsx
export function ParticipationsPage() {
  const [activeTab, setActiveTab] = useState<'a_faire' | 'fait' | 'gagne' | 'tous'>('a_faire');
  const [participations, setParticipations] = useState<Participation[]>([]);

  useEffect(() => {
    fetchParticipations(activeTab === 'tous' ? undefined : activeTab)
      .then(setParticipations);
  }, [activeTab]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Historique</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Participations" value={stats.total} />
        <StatCard label="À faire" value={stats.a_faire} color="warning" />
        <StatCard label="Participé" value={stats.fait} color="info" />
        <StatCard label="Gagnés" value={stats.gagne} color="success" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {['a_faire', 'fait', 'gagne', 'tous'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-4 py-2 border-b-2 ${
              activeTab === t 
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500'
            }`}
          >
            {TAB_LABELS[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {participations.map(p => (
          <ParticipationRow key={p.id} participation={p} />
        ))}
      </div>
    </div>
  );
}

function ParticipationRow({ participation }: { participation: Participation }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <h4 className="font-semibold">{participation.contest.titre}</h4>
        <p className="text-sm text-gray-600">
          {participation.contest.marque} • {participation.date_participation?.toLocaleDateString()}
        </p>
        {participation.notes && (
          <p className="text-xs text-blue-600 mt-1">
            📝 {participation.notes}
          </p>
        )}
      </div>
      
      <BadgeStatus status={participation.statut} />
      
      <a
        href={participation.contest.lien_source}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 text-primary hover:underline"
      >
        Voir
      </a>
    </div>
  );
}
```

### 2.5 Settings Page

```tsx
export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    await updateSettings(settings!);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      {saved && <SuccessAlert message="Paramètres sauvegardés" />}

      {/* Profile */}
      <Section title="Profil">
        <FormGroup label="Nom">
          <input
            type="text"
            value={settings.name || ''}
            onChange={(e) => setSettings({
              ...settings,
              name: e.target.value
            })}
            className="form-control"
          />
        </FormGroup>

        <FormGroup label="Téléphone">
          <input
            type="tel"
            value={settings.phone || ''}
            onChange={(e) => setSettings({
              ...settings,
              phone: e.target.value
            })}
            className="form-control"
          />
        </FormGroup>
      </Section>

      {/* Preferences */}
      <Section title="Préférences de Participation">
        <p className="text-sm text-gray-600 mb-3">
          Types de participation à masquer par défaut:
        </p>
        <div className="space-y-2">
          {PARTICIPATION_TYPES.map(t => (
            <label key={t} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.types_participation_masquees?.includes(t)}
                onChange={(e) => {
                  const masked = e.target.checked
                    ? [...(settings.types_participation_masquees || []), t]
                    : (settings.types_participation_masquees || []).filter(x => x !== t);
                  setSettings({ ...settings, types_participation_masquees: masked });
                }}
              />
              <span className="ml-2">{capitalize(t)}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Display */}
      <Section title="Affichage">
        <FormGroup label="Langue">
          <select
            value={settings.langue}
            onChange={(e) => setSettings({
              ...settings,
              langue: e.target.value as any
            })}
            className="form-control"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </FormGroup>

        <FormGroup label="Thème">
          <select
            value={settings.theme}
            onChange={(e) => setSettings({
              ...settings,
              theme: e.target.value as any
            })}
            className="form-control"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="auto">Système</option>
          </select>
        </FormGroup>
      </Section>

      {/* Danger Zone */}
      <Section title="Données" variant="danger">
        <div className="space-y-3">
          <button className="btn btn-secondary w-full">
            📥 Exporter mes données
          </button>
          <button className="btn btn-outline w-full">
            🗑️ Supprimer mon compte
          </button>
        </div>
      </Section>

      {/* Save */}
      <div className="mt-6 flex gap-2">
        <button onClick={handleSave} className="btn btn-primary">
          Enregistrer
        </button>
        <button className="btn btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  );
}
```

---

## 3. Responsive Design Breakpoints

```css
Mobile:   < 640px  - Single column, collapsible sidebar
Tablet:   640-1024px - 2 columns, hamburger menu
Desktop:  > 1024px - Full sidebar visible
```

---

## 4. Loading States & Skeletons

```tsx
// Skeleton for contest card
export function ContestCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
        <div className="h-6 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  );
}
```

---

## 5. Accessibility Checklist

- ✅ All buttons have `aria-label`
- ✅ Form inputs linked to labels (`<label htmlFor>`)
- ✅ Color contrast ≥ 4.5:1 for text
- ✅ Focus indicators visible
- ✅ Keyboard navigation supported
- ✅ Error messages associated with inputs (`aria-describedby`)
- ✅ Loading states announced (`aria-busy`)

---

## 6. Dark Mode Support

```css
/* Light (default) */
:root {
  --bg-primary: #FCFCF9;
  --text-primary: #134252;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1F2121;
    --text-primary: #F5F5F5;
  }
}
```

---

## 7. Animation & Transitions

```css
/* Smooth transitions */
.btn {
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Pulse for loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

**Component Stubs Ready for Implementation:**
- ✅ Contest cards
- ✅ Filter sidebar  
- ✅ Dashboard layout
- ✅ Participation history
- ✅ Settings
- ✅ Auth pages (ready with Supabase)
- ✅ Admin panel (basic)
