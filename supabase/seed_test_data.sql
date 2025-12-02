-- Données de test pour Contest AI Dashboard
-- À exécuter dans Supabase SQL Editor après avoir créé le schéma

-- Insertion de concours de test
INSERT INTO concours (
  titre, marque, description, lien_source,
  type_participation, categorie_lot,
  temps_estime, valeur_estimee, nombre_lots,
  date_fin, score_pertinence,
  conditions_resumees, raison_score,
  achat_obligatoire, pays_eligibles, age_min,
  statut, clicks_count, comments_count
) VALUES
-- Concours Tech
(
  'Gagnez un iPhone 15 Pro',
  'Apple France',
  'Participez pour gagner le dernier iPhone 15 Pro. Tirage au sort simple et gratuit parmi tous les participants. Aucun achat requis.',
  'https://example.com/concours-iphone-' || gen_random_uuid()::text,
  'tirage',
  'tech',
  5,
  1200,
  1,
  NOW() + INTERVAL '30 days',
  0.85,
  'Gratuit, France 18+, Fin dans 30 jours',
  'Lot intéressant: 1200€ • Rapide: 5 min • Tirage simple (gratuit)',
  false,
  ARRAY['FR'],
  18,
  'actif',
  245,
  12
),

-- Concours Voyage
(
  'Voyage aux Maldives à gagner',
  'Agence Voyages Plus',
  'Gagnez un séjour de 7 jours aux Maldives pour 2 personnes en formule tout compris. Vol + hôtel 5 étoiles inclus.',
  'https://example.com/concours-maldives-' || gen_random_uuid()::text,
  'direct',
  'voyage',
  10,
  3000,
  1,
  NOW() + INTERVAL '45 days',
  0.90,
  'Gratuit, France 18+, Formulaire simple',
  'Lot exceptionnel: 3000€ • Rapide: 10 min • Formulaire direct',
  false,
  ARRAY['FR'],
  18,
  'actif',
  567,
  34
),

-- Concours Gaming
(
  'Console PS5 + 2 jeux',
  'PlayStation France',
  'Tentez de gagner une PlayStation 5 édition standard avec 2 jeux au choix parmi une sélection.',
  'https://example.com/concours-ps5-' || gen_random_uuid()::text,
  'quiz',
  'tech',
  15,
  600,
  3,
  NOW() + INTERVAL '20 days',
  0.75,
  'Gratuit, France 18+, Quiz 5 questions',
  'Bonne valeur: 600€ • Quiz simple • 3 gagnants',
  false,
  ARRAY['FR'],
  18,
  'actif',
  892,
  67
),

-- Concours réseaux sociaux
(
  'Bon d''achat Décathlon 500€',
  'Décathlon',
  'Gagnez un bon d''achat de 500€ valable dans tous les magasins Décathlon et sur décathlon.fr',
  'https://example.com/concours-decathlon-' || gen_random_uuid()::text,
  'reseaux_sociaux',
  'argent',
  8,
  500,
  1,
  NOW() + INTERVAL '15 days',
  0.65,
  'Gratuit, France 18+, Follow Instagram + Tag 2 amis',
  'Bon lot: 500€ • Rapide mais réseaux sociaux requis',
  false,
  ARRAY['FR'],
  18,
  'actif',
  1234,
  89
),

-- Concours créatif
(
  'Création d''affiche publicitaire',
  'Coca-Cola France',
  'Créez l''affiche publicitaire de notre nouvelle campagne été. Le gagnant verra son design utilisé nationalement.',
  'https://example.com/concours-coca-' || gen_random_uuid()::text,
  'creativ',
  'argent',
  120,
  2000,
  1,
  NOW() + INTERVAL '60 days',
  0.70,
  'Gratuit, France 18+, Création graphique requise',
  'Gros lot: 2000€ • Long (2h) • Créativité demandée',
  false,
  ARRAY['FR'],
  18,
  'actif',
  345,
  23
),

-- Concours tech #2
(
  'MacBook Air M3',
  'Apple Education',
  'Pour célébrer la rentrée, gagnez le nouveau MacBook Air avec puce M3.',
  'https://example.com/concours-macbook-' || gen_random_uuid()::text,
  'tirage',
  'tech',
  5,
  1500,
  1,
  NOW() + INTERVAL '25 days',
  0.88,
  'Gratuit, France 18+, Étudiants prioritaires',
  'Excellent lot: 1500€ • Très rapide: 5 min • Tirage simple',
  false,
  ARRAY['FR'],
  18,
  'actif',
  678,
  45
),

-- Concours avec achat (score plus bas)
(
  'TV Samsung 65" avec bon d''achat',
  'Carrefour',
  'Gagnez une TV Samsung 65" en achetant 50€ de produits Samsung',
  'https://example.com/concours-samsung-' || gen_random_uuid()::text,
  'achat',
  'tech',
  10,
  1000,
  5,
  NOW() + INTERVAL '10 days',
  0.45,
  'Achat obligatoire (50€), France 18+, Ticket de caisse à conserver',
  'Bon lot mais achat obligatoire • Pénalité score',
  true,
  ARRAY['FR'],
  18,
  'actif',
  234,
  8
),

-- Concours enfants
(
  'Jouets LEGO collection complète',
  'LEGO France',
  'Gagnez la collection LEGO Harry Potter complète (valeur 800€)',
  'https://example.com/concours-lego-' || gen_random_uuid()::text,
  'direct',
  'enfants',
  8,
  800,
  2,
  NOW() + INTERVAL '35 days',
  0.82,
  'Gratuit, France tous âges, Formulaire simple',
  'Super lot enfants: 800€ • Rapide • 2 gagnants',
  false,
  ARRAY['FR'],
  0,
  'actif',
  456,
  34
),

-- Concours argent
(
  'Gagnez 5000€ en cash',
  'Banque Populaire',
  'Tirage au sort pour gagner 5000€ versés directement sur votre compte bancaire',
  'https://example.com/concours-cash-' || gen_random_uuid()::text,
  'tirage',
  'argent',
  5,
  5000,
  1,
  NOW() + INTERVAL '40 days',
  0.92,
  'Gratuit, France 18+, Aucune obligation bancaire',
  'Gros lot cash: 5000€ • Ultra rapide: 5 min • Tirage simple',
  false,
  ARRAY['FR'],
  18,
  'actif',
  2345,
  156
),

-- Concours voyage #2
(
  'Week-end à Paris pour 2',
  'Office du Tourisme de Paris',
  'Gagnez un week-end romantique à Paris : hôtel 4* + dîner + visite guidée',
  'https://example.com/concours-paris-' || gen_random_uuid()::text,
  'quiz',
  'voyage',
  20,
  600,
  5,
  NOW() + INTERVAL '18 days',
  0.78,
  'Gratuit, France 18+, Quiz culture générale (10 questions)',
  'Joli lot: 600€ • Quiz moyen • 5 gagnants',
  false,
  ARRAY['FR'],
  18,
  'actif',
  789,
  67
);

-- Afficher le résultat
SELECT
  COUNT(*) as total_concours,
  COUNT(CASE WHEN type_participation = 'tirage' THEN 1 END) as tirages,
  COUNT(CASE WHEN type_participation = 'direct' THEN 1 END) as directs,
  COUNT(CASE WHEN type_participation = 'quiz' THEN 1 END) as quiz,
  COUNT(CASE WHEN achat_obligatoire = true THEN 1 END) as avec_achat
FROM concours
WHERE statut = 'actif';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ 10 concours de test ont été insérés avec succès!';
  RAISE NOTICE '📊 Répartition: 3 tirages, 3 directs, 3 quiz, 1 achat, 1 créatif';
  RAISE NOTICE '🎯 Catégories: 4 tech, 2 voyage, 2 argent, 1 enfants, 1 créatif';
END $$;
