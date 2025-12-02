# API Specification - Contest AI Platform

## Routes & Endpoints

### Authentication (Supabase Auth)
```
POST /api/auth/signup
- Body: { email, password }
- Response: { user_id, session }

POST /api/auth/login
- Body: { email, password }
- Response: { user_id, session }

POST /api/auth/logout
- Response: { success: true }

GET /api/auth/me
- Response: { user: User }
```

---

## Concours Routes

### GET /api/concours
**Récupère liste concours avec filtres**

Query params:
```
- skip: number (default 0)
- limit: number (default 20)
- sort: 'score' | 'date_fin' | 'temps' | 'valeur' (default 'score')
- type_participation: string[] (filter)
- exclude_reseaux_sociaux: boolean
- exclude_achat: boolean
- categorie: string[] (filter)
- search: string (texte search)
- statut: 'actif' | 'clos' | 'spam' (default 'actif')
```

Response:
```typescript
{
  contests: Contest[],
  total: number,
  hasMore: boolean
}

// Contest object
{
  id: string,
  titre: string,
  marque: string,
  description: string,
  lien_source: string,
  date_fin: ISO8601,
  date_ajout: ISO8601,
  type_participation: string,
  categorie_lot: string,
  temps_estime: number,
  valeur_estimee: number,
  nombre_lots: number,
  conditions_resumees: string,
  score_pertinence: number, // 0-1
  raison_score: string,
  achat_obligatoire: boolean,
  participation_status: 'a_faire' | 'fait' | 'gagne' | 'perdu' | 'ignore' | null
}
```

---

### GET /api/concours/:id
**Détails complet concours**

Response: Contest (full details)

---

### POST /api/concours
**Créer concours manuel (Admin)**

Body:
```json
{
  "titre": "string",
  "marque": "string",
  "description": "string",
  "lien_source": "url",
  "date_fin": "2025-12-31",
  "type_participation": "direct|quiz|...",
  "categorie_lot": "voyage|tech|...",
  "temps_estime": 15,
  "valeur_estimee": 500,
  "achat_obligatoire": false
}
```

Response: Created Contest

---

## Participations Routes

### GET /api/participations
**Historique participations perso**

Query params:
```
- statut: 'a_faire' | 'fait' | 'gagne' | 'perdu' | 'ignore' (optional)
- sort: 'date' | 'score' (default 'date')
```

Response:
```typescript
{
  participations: Participation[],
  stats: {
    total: number,
    a_faire: number,
    fait: number,
    gagne: number
  }
}
```

---

### POST /api/participations
**Créer/mettre à jour participation**

Body:
```json
{
  "concours_id": "uuid",
  "statut": "a_faire|fait|gagne|perdu|ignore",
  "notes": "string" (optional)
}
```

Response: Participation object

---

### PUT /api/participations/:id
**Mettre à jour participation**

Body: Partial Participation

Response: Updated Participation

---

### DELETE /api/participations/:id
**Supprimer participation**

Response: { success: true }

---

## IA Scoring Routes

### POST /api/ia/score
**Calculer score pour concours**

Body:
```json
{
  "concours_id": "uuid"
}
```

Response:
```typescript
{
  score: number, // 0-100
  raison: string,
  duration_ms: number
}
```

---

### POST /api/ia/summarize
**Résumer conditions concours**

Body:
```json
{
  "concours_id": "uuid"
}
```

Response:
```typescript
{
  conditions_resumees: string,
  achat_obligatoire: boolean,
  pays_eligibles: string[],
  age_min: number | null
}
```

---

## Settings Routes

### GET /api/users/settings
**Récupérer settings perso**

Response: User settings object

---

### PUT /api/users/settings
**Mettre à jour settings**

Body:
```json
{
  "name": "string",
  "phone": "string",
  "types_participation_masquees": ["reseaux_sociaux", "achat"],
  "categories_interessantes": ["voyage", "tech"],
  "langue": "fr|en",
  "theme": "light|dark|auto"
}
```

Response: Updated settings

---

### DELETE /api/users/delete
**Supprimer compte (RGPD)**

Response: { success: true }

---

## Admin Routes

### GET /api/admin/stats
**Stats système (admin only)**

Response:
```typescript
{
  total_concours: number,
  total_actifs: number,
  last_ingestion: ISO8601,
  sources: {
    [source]: { count: number, last_updated: ISO8601 }
  }
}
```

---

### POST /api/admin/ingest
**Trigger ingestion données (admin only)**

Body:
```json
{
  "source": "concoursetjeux|grandjeux|manual" (optional)
}
```

Response:
```typescript
{
  imported: number,
  duplicates: number,
  errors: string[]
}
```

---

### POST /api/admin/import-csv
**Import CSV concours (admin only)**

Body: FormData { file: File }

Response:
```typescript
{
  imported: number,
  errors: { row: number, error: string }[]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid parameters",
  "details": "type_participation must be one of: ..."
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please login first"
}
```

### 404 Not Found
```json
{
  "error": "Concours not found",
  "id": "uuid"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error",
  "request_id": "uuid"
}
```

---

## Rate Limiting

All endpoints rate-limited:
- Logged in: 100 requests/minute
- Admin: 1000 requests/minute
- Public: 10 requests/minute

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Pagination

All list endpoints support:
```
- skip: number (offset, default 0)
- limit: number (max 100, default 20)
```

Response includes:
```
- total: number (total records)
- hasMore: boolean (more records available)
```

---

## Timestamps

All timestamps: ISO 8601 format
```
2025-12-31T23:59:59.000Z
```

---

## TypeScript Types (for reference)

```typescript
type ParticipationType = 'direct' | 'reseaux_sociaux' | 'quiz' | 'creativ' | 'achat' | 'tirage';
type LotCategory = 'voyage' | 'tech' | 'argent' | 'enfants' | 'autre';
type ParticipationStatus = 'a_faire' | 'fait' | 'gagne' | 'perdu' | 'ignore';
type ContestStatus = 'actif' | 'clos' | 'spam' | 'archived';

interface Contest {
  id: string;
  titre: string;
  marque: string;
  description: string;
  lien_source: string;
  source: string;
  date_fin: string;
  date_ajout: string;
  type_participation: ParticipationType;
  categorie_lot: LotCategory;
  temps_estime: number;
  valeur_estimee: number;
  nombre_lots: number;
  conditions_resumees: string;
  score_pertinence: number;
  raison_score: string;
  achat_obligatoire: boolean;
  pays_eligibles: string[];
  age_min?: number;
  statut: ContestStatus;
  participation_status?: ParticipationStatus;
  created_at: string;
  updated_at: string;
}

interface Participation {
  id: string;
  concours_id: string;
  statut: ParticipationStatus;
  date_participation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  types_participation_affichees: ParticipationType[];
  types_participation_masquees: ParticipationType[];
  categories_interessantes: LotCategory[];
  langue: 'fr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  total_participations: number;
  total_gagnes: number;
  created_at: string;
  updated_at: string;
}
```
