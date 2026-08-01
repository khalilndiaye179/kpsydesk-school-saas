# Prompt d'implémentation — Authentification RBAC multi-tenant (PostgreSQL RLS)

## Contexte
Construire un système d'authentification RBAC pour une application SaaS multi-tenant.
- Échelle cible : centaines à milliers de tenants (abonnés)
- Stack : PostgreSQL, une seule base de données partagée entre tous les tenants
- Exigence stricte : isolement des données — un tenant ne doit jamais pouvoir lire ou écrire les données d'un autre tenant, même en cas d'erreur applicative
- Approche retenue : Row-Level Security (RLS) PostgreSQL comme garde-fou structurel, doublé d'un scoping applicatif (repository pattern) comme première ligne de défense

## Objectif
Implémenter un système où l'isolement tenant est garanti à la fois par la base de données (RLS) et par la couche applicative, avec une gestion correcte du pooling de connexions.

## 1. Modèle de données

Concevoir les tables suivantes (adapter les noms au projet) :
- `tenants` (id, nom, statut, créé_le)
- `users` (id, tenant_id, email, mot_de_passe_hash, statut)
- `roles` (id, tenant_id nullable — nullable si rôles globaux type "super_admin", nom)
- `permissions` (id, ressource, action) — ex. (`documents`, `read`), (`documents`, `write`)
- `role_permissions` (role_id, permission_id)
- `user_roles` (user_id, role_id)

Toutes les tables métier contenant des données propres à un tenant doivent avoir une colonne `tenant_id NOT NULL` avec une contrainte de clé étrangère vers `tenants(id)`.

**Distinguer explicitement** :
- Tables tenant-scoped → RLS activé
- Tables globales (référentiels partagés, config système) → RLS désactivé, à documenter dans un registre explicite (fichier ou table `schema_isolation_registry`)

## 2. Row-Level Security (PostgreSQL)

Pour chaque table tenant-scoped :

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY; -- s'applique aussi au propriétaire de la table

CREATE POLICY tenant_isolation_select ON documents
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

Exigences :
- Utiliser `current_setting('app.tenant_id', true)` (le `true` évite une erreur si la variable n'est pas définie — dans ce cas, retourner un résultat vide plutôt qu'une erreur qui pourrait être mal gérée par l'application).
- Écrire un script de génération qui applique automatiquement la policy à toute nouvelle table marquée comme tenant-scoped (éviter l'oubli manuel).
- Ajouter une policy `WITH CHECK` identique pour empêcher l'insertion de lignes avec un `tenant_id` différent du tenant courant.

## 3. Gestion de la session tenant (critique pour le pooling)

**Ne jamais utiliser `SET app.tenant_id`** (portée session) si un pooler de connexions (PgBouncer en mode transaction) est utilisé — la variable persisterait au-delà de la requête légitime.

**Utiliser systématiquement `SET LOCAL`**, dans une transaction explicite :

```sql
BEGIN;
SET LOCAL app.tenant_id = '<tenant_id>';
-- requêtes métier
COMMIT;
```

`SET LOCAL` est automatiquement réinitialisé au `COMMIT`/`ROLLBACK`, donc sûr même avec un pooler en mode transaction.

Implémenter un middleware/intercepteur qui, pour chaque requête HTTP authentifiée :
1. Extrait `tenant_id` et les rôles depuis le JWT (déjà validé par le service d'authentification)
2. Ouvre une transaction DB, exécute `SET LOCAL app.tenant_id`
3. Exécute la logique métier dans cette transaction
4. Commit ou rollback

Écrire un test qui simule un pool de connexions partagé entre deux requêtes de tenants différents pour vérifier qu'aucune fuite de contexte ne se produit.

## 4. RBAC (indépendant de l'isolement tenant)

- Le JWT contient : `sub` (user_id), `tenant_id`, `roles` (liste de noms de rôles)
- Le middleware vérifie les permissions requises pour chaque route/action via une fonction `hasPermission(user, resource, action)` qui interroge `role_permissions` via `user_roles`
- Garder cette vérification totalement séparée de la logique d'isolement tenant — un rôle ne doit jamais pouvoir élargir la portée tenant d'un utilisateur

## 5. Scoping applicatif (première ligne de défense)

- Toute requête métier passe par une couche repository qui injecte automatiquement `tenant_id` dans les clauses `WHERE` — ne jamais laisser une route accéder directement à la DB sans passer par cette couche
- Cette couche est redondante avec RLS par design : elle sert de première ligne (performance, clarté) tandis que RLS est le filet de sécurité ultime en cas d'oubli

## 6. Tests et audit continu

Livrer une suite de tests qui, à chaque exécution CI :
- Crée deux tenants avec des données distinctes
- Tente, pour chaque table tenant-scoped, une lecture/écriture croisée en simulant le contexte de l'autre tenant
- Échoue le build si une seule ligne d'un tenant est visible depuis le contexte d'un autre
- Vérifie que chaque nouvelle table ajoutée au schéma a soit une policy RLS active, soit une entrée explicite dans le registre des tables globales

## Livrables attendus
1. Migrations SQL (schéma + policies RLS)
2. Middleware d'authentification (JWT → transaction DB avec `SET LOCAL`)
3. Couche RBAC (vérification de permissions)
4. Couche repository avec scoping automatique
5. Suite de tests d'isolation multi-tenant exécutable en CI
6. Registre documenté des tables tenant-scoped vs globales

## Hors périmètre
- Interface d'administration des rôles (à traiter séparément)
- Migration de tenants existants vers ce modèle (si applicable, à traiter comme projet distinct)
