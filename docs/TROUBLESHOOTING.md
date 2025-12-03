# Guide de Diagnostic - Résolution des Problèmes

## 🔴 Problème 1 : Erreur 406 sur /user_preferences

### Symptômes
```
Failed to load resource: the server responded with a status of 406 ()
Error: Cannot read properties of null (reading 'email')
```

### Causes Possibles
1. **Row Level Security (RLS)** non configuré correctement dans Supabase
2. L'utilisateur n'a pas les permissions pour lire ses propres préférences

### ✅ Solution : Vérifier les RLS Policies dans Supabase

1. **Aller dans Supabase Dashboard** → Votre projet → Table Editor → `user_preferences`

2. **Vérifier que ces policies existent** :

```sql
-- Policy pour SELECT (lecture)
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = id);

-- Policy pour INSERT (création)
CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy pour UPDATE (mise à jour)
CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

3. **Si les policies n'existent pas, les créer** :
   - Aller dans "Authentication" → "Policies"
   - Sélectionner la table `user_preferences`
   - Cliquer "New Policy"
   - Créer les 3 policies ci-dessus

### 🔍 Test Rapide
Après avoir créé les policies, déconnectez-vous et reconnectez-vous sur le site.

---

## 🔴 Problème 2 : Le Scraping Ne Fonctionne Pas

### Symptômes
- Pas de nouveaux concours après avoir cliqué "Lancer le Scraping"
- La page admin ne montre aucun résultat

### Causes Possibles
1. Le site cible (lesdemonsdujeu.com) bloque le scraping (403 Forbidden)
2. La structure HTML du site a changé
3. Problème de connexion Supabase
4. Le scraper n'a jamais été exécuté

### ✅ Diagnostic Étape par Étape

#### Étape 1 : Vérifier les Variables d'Environnement

Dans `.env.local`, vérifiez que vous avez :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

#### Étape 2 : Tester le Scraping en Local

```bash
# Terminal 1 - Démarrer le serveur
npm run dev

# Terminal 2 - Tester l'API directement
curl -X POST http://localhost:3000/api/admin/ingest \
  -H "Content-Type: application/json" \
  -v

# Ou via l'interface web
# Ouvrir : http://localhost:3000/admin
# Cliquer sur "🔄 Lancer le Scraping"
# Ouvrir la console (F12) pour voir les logs
```

#### Étape 3 : Vérifier les Logs Console

Ouvrez la console du navigateur (F12 → Console) et cherchez :
- ✅ `"Found X contests using selector: ..."` → Le scraper trouve des concours
- ❌ `"No contest elements found"` → Structure HTML différente
- ❌ `"403 Forbidden"` → Le site bloque
- ❌ `"Failed to insert"` → Problème Supabase

#### Étape 4 : Vérifier dans Supabase

```sql
-- Voir si des concours ont été ajoutés
SELECT COUNT(*), source
FROM concours
GROUP BY source;

-- Voir les derniers concours
SELECT titre, source, created_at
FROM concours
ORDER BY created_at DESC
LIMIT 10;

-- Voir les logs d'ingestion
SELECT *
FROM ingest_logs
ORDER BY started_at DESC
LIMIT 5;
```

### 🛠️ Solutions selon le Problème

#### Si Erreur 403 (Site Bloque)
C'est normal, le site `lesdemonsdujeu.com` peut avoir une protection anti-scraping.

**Solutions :**
1. **Ajouter d'autres sources** qui n'ont pas de protection
2. **Contacter le site** pour demander une API officielle
3. **Utiliser un service proxy** (non recommandé)

#### Si "No contest elements found"
La structure HTML du site a changé.

**Solution :**
1. Aller sur https://www.lesdemonsdujeu.com/concours
2. Faire clic droit → "Inspecter"
3. Trouver les sélecteurs CSS corrects pour les concours
4. Mettre à jour `lib/scrapers/lesdemonsdujeu.ts`

#### Si Problème Supabase
Vérifier les permissions RLS (voir Problème 1 ci-dessus).

---

## 🧪 Test Complet du Système

### Test 1 : Authentification
```bash
1. Aller sur /auth/login
2. Se connecter
3. Vérifier redirection vers /dashboard
✅ Si ça fonctionne → Auth OK
```

### Test 2 : Settings
```bash
1. Aller sur /settings
2. La page doit se charger sans erreur 406
3. Modifier un paramètre et sauvegarder
✅ Si ça fonctionne → RLS OK
```

### Test 3 : Scraping
```bash
1. Aller sur /admin
2. Cliquer "🔄 Lancer le Scraping"
3. Ouvrir Console (F12)
4. Vérifier les logs
✅ Si résultats > 0 → Scraping OK
```

### Test 4 : Dashboard
```bash
1. Aller sur /dashboard
2. Voir la liste des concours
3. Vérifier que les concours tests sont là
✅ Si concours visibles → Dashboard OK
```

---

## 🚀 Solution Alternative : Ajouter des Concours Manuellement

Si le scraping ne fonctionne pas, vous pouvez ajouter des concours via l'API :

```bash
curl -X POST http://localhost:3000/api/concours \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Concours Test",
    "marque": "Ma Marque",
    "description": "Un super concours à gagner",
    "lien_source": "https://exemple.com/concours-1",
    "type_participation": "direct",
    "categorie_lot": "tech",
    "temps_estime": 5,
    "valeur_estimee": 500,
    "date_fin": "2025-12-31T23:59:59Z"
  }'
```

---

## 📞 Checklist de Debug

- [ ] Variables d'environnement configurées
- [ ] RLS Policies créées pour `user_preferences`
- [ ] RLS Policies créées pour `concours`
- [ ] Compte utilisateur créé et connecté
- [ ] Page /settings fonctionne sans erreur 406
- [ ] Page /admin accessible
- [ ] Scraping testé (même si erreur 403)
- [ ] Au moins quelques concours visibles sur /dashboard

---

## 💡 Astuce : Mode Debug

Pour voir plus de détails, activez les logs détaillés :

**Dans `lib/scrapers/index.ts`**, ligne 26 :
```typescript
console.log(`Scraping ${config.name}...`)
console.log(`Fetching: ${config.baseUrl}`) // Ajoutez cette ligne
```

**Dans `lib/scrapers/lesdemonsdujeu.ts`**, ligne 38 :
```typescript
console.log(`Found ${elements.length} contests using selector: ${selector}`)
console.log(`HTML length: ${html.length}`) // Ajoutez avant la boucle
```

---

## 📚 Ressources

- **Supabase RLS** : https://supabase.com/docs/guides/auth/row-level-security
- **Next.js API Routes** : https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Cheerio Docs** : https://cheerio.js.org/
- **Debugging Scrapers** : https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-the-DOM
