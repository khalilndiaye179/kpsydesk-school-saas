# Prompt Maître Consolidé — KPSyDesk School
## Plateforme SaaS Multi-tenant de Gestion Scolaire
### Espace Tenant + Console de Pilotage Super Admin

---

## 0. VISION D'ENSEMBLE

Ce document unique regroupe l'intégralité des prompts précédemment définis
pour Antigravity : le périmètre fonctionnel de l'espace tenant, celui de la
**Console Super Admin** (visibilité totale et mainmise complète sur tous les
tenants/établissements abonnés), l'architecture commune, le système
visuel unifié (charte partagée), et la roadmap d'implémentation.

La plateforme comporte **deux espaces distincts mais de la même famille de
produit** :

| | Espace Tenant | Console Super Admin |
|---|---|---|
| Utilisateurs | Personnel des établissements (direction, enseignants, comptables, parents, élèves) | Vous et votre équipe (support, commercial, technique) |
| Objectif | Gérer un établissement au quotidien | Piloter l'ensemble de la plateforme SaaS |
| Ton visuel | Sobre, futuriste — charte visuelle partagée (distinction par contenu + badge de rôle) | Sobre, futuriste — charte visuelle partagée (distinction par contenu + badge de rôle) |
| Accès aux données | Scopé à un seul tenant | Vue transverse sur tous les tenants |

### Stack technique commune (référence unique pour tout le document)

**Frontend (client)**
- Framework : React 18 & TypeScript
- Outil de build : Vite (rechargement à chaud ultra-rapide)
- Serveur de production : Nginx conteneurisé
- Graphiques : Chart.js
- Exportations : SheetJS (Excel) & jsPDF (PDF)

**Backend (serveur API)**
- Framework : NestJS (Node.js)
- Langage : TypeScript
- ORM : Prisma ORM
- Sécurité : JWT multi-tenant & RLS (Row Level Security)

**Base de données**
- SGBD : PostgreSQL 16 (Alpine)
- Persistance : volumes Docker nommés
- Migrations : Prisma CLI

**Conteneurisation & DevOps**
- Orchestration : Docker Compose v3.8
- Réseaux : isolation par bridge virtuel
- Builds : Dockerfiles multi-stage optimisés

Isolation multi-tenant : contexte de requête (AsyncLocalStorage) résolvant
un `tenant_id`, appliqué systématiquement via des filtres globaux au niveau
ORM. Système visuel unifié partagé entre les deux espaces — détail complet
dans le fichier de charte graphique séparé (section 5 ci-dessous).

---

## 1. PROMPT MAÎTRE GLOBAL (à donner en premier à Antigravity)

```
CONTEXTE GÉNÉRAL DU PROJET
Je développe KPSyDesk School, une plateforme SaaS multi-tenant de gestion
scolaire. Stack : NestJS + PostgreSQL (Prisma ORM) côté backend,
React + TypeScript (Vite) côté frontend, Nginx conteneurisé en production,
Docker Compose v3.8 pour l'orchestration. L'isolation multi-tenant repose
sur un contexte de requête (AsyncLocalStorage) résolvant un tenant_id,
appliqué systématiquement via des filtres globaux au niveau ORM.

La plateforme comporte DEUX espaces applicatifs distincts, à ne jamais
mélanger dans le code, le routing, ni le design :

1. ESPACE TENANT (abonné) : utilisé en autonomie totale par chaque
   établissement scolaire abonné (école, collège, lycée, centre de
   formation professionnelle). Périmètre détaillé en section 2.

2. CONSOLE SUPER ADMIN : utilisée uniquement par mon équipe interne pour
   piloter l'ensemble des tenants — visibilité totale, gestion des
   abonnements/facturation, activation des modules, support, monitoring
   technique. Périmètre détaillé en section 3.

RÈGLE D'ARCHITECTURE FONDAMENTALE
Les deux espaces ont des domaines d'authentification et d'autorisation
strictement séparés. Un utilisateur super admin n'est PAS un utilisateur
d'un tenant avec un rôle élevé — c'est un domaine d'accès différent, avec
sa propre table d'utilisateurs internes, ses propres permissions, et un
accès en lecture/écriture transverse aux données de tous les tenants
UNIQUEMENT via des endpoints dédiés, jamais en contournant les filtres
tenant existants pour les endpoints de l'espace tenant.

MÉTHODE DE TRAVAIL
Je vais te donner le prompt de chaque espace séparément (fonctionnel puis
design). Construis d'abord l'architecture commune (section 4), fais-la moi
valider, puis avance espace par espace, module par module, en attendant ma
validation à chaque étape. Ne génère jamais un module entier sans un
aperçu préalable (architecture ou wireframe selon le cas).
```

---

## 2. ESPACE TENANT — RAPPEL DU PÉRIMÈTRE FONCTIONNEL

```
PÉRIMÈTRE FONCTIONNEL — ESPACE TENANT

Adaptation dynamique selon institution_type (ECOLE, COLLEGE, LYCEE,
FORMATION_PRO), piloté par un champ sur le tenant, sans dupliquer le modèle
de données.

MODULES CŒUR (socle)
1. Configuration établissement (année scolaire/session, structure
   pédagogique, personnalisation)
2. Inscriptions & admissions (formulaire en ligne, workflow de validation)
3. Structure pédagogique (classes/sections ou promotions/modules)
4. Emploi du temps (génération manuelle, vue calendrier)
5. Évaluations & notes (adaptatif : moyennes/coefficients vs
   compétences/blocs)
6. Bulletins/attestations (génération PDF avec charte graphique)
7. Absences & discipline
8. Finances & facturation (scolarité, frais annexes, paiements, reçus)
9. RH & personnel (enseignants/formateurs)
10. Communication (messagerie interne, notifications)
11. Reporting & statistiques par établissement

MODULES DIFFÉRENCIANTS (activables individuellement par tenant via
tenant_modules)
Vague 1 — Connectivité : PWA hors-ligne avec synchronisation différée,
fallback SMS/USSD pour les parents sans smartphone
Vague 2 — Engagement parents : prise de RDV parents-enseignants,
messagerie directe modérable, historique consolidé de l'enfant/apprenant
Vague 3 — Formation professionnelle : vérification de certificats par QR
code (page publique non authentifiée), suivi des stages et de l'insertion
professionnelle
Vague 4 — Intelligence : détection de décrochage scolaire (règles
configurables + job planifié), génération assistée d'emploi du temps
Vague 5 — Conformité & vie scolaire : export statistiques officielles,
signature électronique, module RGPD (consentement, portabilité,
suppression), infirmerie, transport, bibliothèque numérique, gestion
d'événements

EXIGENCES TRANSVERSALES
- Filtres avancés + export Excel/PDF sur toute liste de données
- RBAC fin (Directeur, Censeur, Enseignant, Comptable, Parent, Élève)
- Interface 100% paramétrable sans intervention développeur
- Responsive complet (usage mobile prioritaire pour enseignants/parents)
- Chaque module additionnel activable/désactivable par tenant

DESIGN — ESPACE TENANT (résumé, charte complète dans le fichier design v2)
Charte unifiée avec la Console Super Admin. Palette : sidebar #0E1220,
fond page #F4F5FA, accent indigo #5B6CFF, accent data #22D3EE. Typo :
Space Grotesk 700 (titres/KPI), Inter 400/500 (UI), JetBrains Mono
(données). Élément signature : pill switcher plat avec soulignement
animé pour les classes/niveaux. Filigrane scolaire discret (livre, mortier,
tableau noir) sur les zones de respiration uniquement.
```

---

## 3. CONSOLE SUPER ADMIN — PÉRIMÈTRE FONCTIONNEL

```
PÉRIMÈTRE FONCTIONNEL — CONSOLE SUPER ADMIN

Objectif : visibilité totale et mainmise opérationnelle sur l'ensemble des
tenants, sans jamais compromettre l'isolation des données entre tenants.

1. GESTION DU CYCLE DE VIE DES TENANTS
   - Création/provisioning d'un nouveau tenant (établissement) : identité,
     type d'établissement, plan d'abonnement initial, domaine/sous-domaine
   - Fiche tenant complète : raison sociale, adresse, email et téléphone
     du représentant légal — obligatoires et validés (format + OTP)
   - Suspension / réactivation d'un tenant (ex. impayé) avec message
     affiché automatiquement aux utilisateurs du tenant concerné
   - Archivage / suppression avec période de rétention paramétrable avant
     purge définitive (conformité RGPD)
   - Historique complet des changements d'état d'un tenant (audit trail)

2. ABONNEMENTS & FACTURATION SAAS
   - Catalogue de plans (fonctionnalités incluses, quotas, tarif, cycle de
     facturation), avec devis personnalisés pour les gros comptes
   - Version d'essai automatique de 7 jours à l'inscription d'un nouveau
     tenant, avec bascule automatique en compte limité/suspendu à
     l'échéance si non converti en abonnement payant
   - Association tenant ↔ plan, changement de plan (upgrade/downgrade)
   - Facturation automatisée, génération de factures, relances automatiques
     en cas d'impayé
   - Intégration aux passerelles de paiement (Wave, Orange Money, Free
     Money en priorité, Stripe/carte bancaire en complément — clés
     publiques/privées isolées par environnement, jamais exposées côté
     frontend)
   - Tableau de bord financier : MRR, ARR, churn, LTV, tenants à risque
     d'impayé

3. ACTIVATION DES MODULES PAR TENANT
   - Interface de gestion de la table tenant_modules : activer/désactiver
     chaque module différenciant (vagues 1 à 5 de l'espace tenant) par
     tenant individuellement ou par lot (ex. tous les tenants d'un plan
     donné)
   - Historique des activations/désactivations avec l'auteur (traçabilité)

4. SUPERVISION & QUOTAS D'USAGE
   - Suivi de la consommation par tenant : nombre d'utilisateurs actifs,
     volume de stockage (documents, exports), nombre d'élèves/apprenants
     enregistrés, appels API le cas échéant
   - Alertes automatiques de dépassement de quota avec notification au
     tenant et à l'équipe interne
   - Vue d'ensemble ("fleet") de tous les tenants avec statut de santé
     (actif, à risque, suspendu, en essai)

5. SUPPORT & ASSISTANCE
   - Système de tickets liés à un tenant (créé par le tenant ou par
     l'équipe interne), historique des échanges
   - Fonction "connexion en tant que" (impersonation) pour le support
     technique, avec consentement/traçabilité stricte (log horodaté de
     chaque session d'impersonation, bandeau visuel permanent indiquant le
     mode impersonation, durée de session limitée)

6. MONITORING TECHNIQUE DE LA PLATEFORME
   - Statut des services (uptime, latence), files d'attente (jobs
     d'export, envois SMS/email, génération PDF) avec visibilité sur les
     échecs et possibilité de relance manuelle
   - Journal d'erreurs applicatives agrégé, filtrable par tenant

7. GESTION DES UTILISATEURS INTERNES & SÉCURITÉ
   - Rôles internes (Super Admin, Support, Commercial, Technique/Ops) avec
     permissions distinctes
   - Journal d'audit de toutes les actions sensibles (suspension d'un
     tenant, changement de plan, accès en impersonation, modification de
     module) : qui, quoi, quand
   - Authentification renforcée obligatoire (2FA) pour tous les comptes
     internes, sans exception — y compris le compte Super Admin initial
     (voir section 3.1 ci-dessous)

8. ANALYTICS & PILOTAGE STRATÉGIQUE
   - Tableaux de bord : croissance du nombre de tenants, répartition par
     type d'établissement, par plan, par zone géographique
   - Taux d'adoption des modules différenciants (aide à la décision produit)
   - Export de ces données pour analyse externe (Excel/PDF, cohérent avec
     le standard déjà appliqué côté tenant)

EXIGENCES TRANSVERSALES SPÉCIFIQUES À CETTE CONSOLE
- Isolation stricte : la console peut LIRE et AGIR sur les données de
  configuration/abonnement de tous les tenants, mais l'accès aux données
  métier d'un tenant (élèves, notes, finances internes à l'établissement)
  doit rester exceptionnel, journalisé, et limité au strict nécessaire
  (support avec consentement, ou obligation légale)
- Toute action destructive ou sensible (suspension, suppression, changement
  de plan, impersonation) nécessite une confirmation explicite et est
  journalisée de façon non modifiable
- 2FA obligatoire, pas d'exception, pour tout compte de cette console
```

### 3.1 Compte Super Admin initial (seed)

Le compte Super Admin racine ci-dessous doit être créé via un script de
seed (Prisma seed) au premier déploiement, jamais codé en dur dans le
frontend ni committé en clair dans le dépôt Git — à injecter via variables
d'environnement (`.env`, non versionné) ou un gestionnaire de secrets
(Docker secrets, Vault, etc.) :

```
SUPER_ADMIN_EMAIL=neguinho.ndiaye@gmail.com
SUPER_ADMIN_PASSWORD=<défini via variable d'environnement, jamais versionné>
```

Exigences de sécurité à appliquer sans exception sur ce compte :
- Hash du mot de passe en base (bcrypt/argon2), jamais stocké en clair
- **Changement de mot de passe obligatoire à la première connexion**
- Activation du 2FA imposée dès la première connexion, avant tout accès
  aux fonctionnalités de la console
- Ce compte doit être le seul avec le rôle racine `SUPER_ADMIN` ; les
  autres collaborateurs internes (support, commercial, technique) sont
  créés depuis la console avec des rôles restreints (section 3, point 7)
- Consigner sa création dans le journal d'audit comme tout autre compte
  interne

---

## 4. ARCHITECTURE COMMUNE À VALIDER EN PREMIER

```
ARCHITECTURE TECHNIQUE COMMUNE

1. Deux domaines d'authentification distincts :
   - `auth/tenant` : utilisateurs rattachés à un tenant_id
   - `auth/platform` (ou `auth/admin`) : utilisateurs internes, table
     séparée, sans tenant_id, avec 2FA obligatoire

2. Modèle tenant_modules : { tenant_id, module_key, enabled, updated_by,
   updated_at } — consulté par guard NestJS côté backend et par le
   frontend pour le masquage de menu/routes, pilotable depuis la console
   super admin (section 3, point 3)

3. Journal d'audit transverse (audit_log) : { actor_type (tenant_user |
   platform_user), actor_id, tenant_id (nullable pour actions plateforme),
   action, target, metadata, created_at } — utilisé à la fois pour la
   conformité RGPD côté tenant et pour la traçabilité des actions super
   admin

4. Séparation stricte des routes API : `/api/v1/tenant/...` (scopé
   automatiquement au tenant courant) vs `/api/v1/platform/...` (réservé
   aux comptes internes, avec vérification explicite du rôle sur chaque
   endpoint, jamais de bypass implicite du scoping tenant)

Valide cette architecture avant de démarrer le développement de l'un ou
l'autre espace.
```

---

## 5. DESIGN — RÉFÉRENCE AU FICHIER DE CHARTE GRAPHIQUE v2

> **Document de référence design :**
> `kpsydesk-school-design-v2-moderne-futuriste.md` (même dossier)

Ce fichier contient l'intégralité de la charte graphique v2 "Moderne &
Futuriste", applicable à l'identique aux deux espaces (Tenant + Console
Super Admin). Résumé des points clés à retenir :

### Principe directeur (v2)

Un **seul système visuel partagé** — sobre, dense, futuriste. Les deux
espaces utilisent la même palette, la même typographie et la même structure
de composants. La distinction repose sur le contenu affiché, le nom en
haut de la sidebar, et le badge de rôle de l'utilisateur.

### Variables CSS (à créer une fois, partagées)

```
--bg-sidebar: #0E1220       Sidebar pleine hauteur
--bg-sidebar-active: #1B2033  Item de navigation actif
--accent: #5B6CFF           Indigo électrique (boutons, focus, badge actif)
--accent-data: #22D3EE      Cyan (graphiques, highlights)
--bg-page: #F4F5FA          Fond de contenu (blanc cassé froid)
--bg-card: #FFFFFF          Cartes KPI, blocs
--status-positive: #16A34A  Tendance positive, statut Actif
--status-negative: #DC2626  Tendance négative, statut Suspendu
--status-warning: #D97706   Statut intermédiaire (Essai, À risque)
--text-primary: #12131A     Titres, chiffres clés
--text-secondary: #6B6E78   Libellés, métadonnées
--border: #E4E5EC           Bordures et séparateurs
```

### Typographie

- **Space Grotesk 700** — titres de section, chiffres héros des cartes KPI
- **Inter 400/500** — navigation, texte courant
- **JetBrains Mono 400** — données tabulaires, montants, identifiants

### Structure commune aux deux espaces

Sidebar pleine hauteur → Topbar (recherche + profil) → Cartes KPI (3–4) →
Bloc donut + courbe → Tableau dense + liste d'activité récente.

### Filigrane scolaire

SVG vectoriel, trait monochrome, opacité 4–8%, uniquement sur les zones de
respiration (jamais sur les données, cartes ou graphiques).

---

## 6. ROADMAP D'IMPLÉMENTATION CONSOLIDÉE

| Phase | Contenu | Espace |
|-------|---------|--------|
| 0 | Architecture commune (auth double domaine, tenant_modules, audit_log) + création du compte Super Admin seed (section 3.1) | Commun |
| 1 | Design system unifié : variables CSS, sidebar/topbar, cartes KPI, composants de base (charte v2) | Les deux |
| 2 | Socle tenant : configuration, structure pédagogique, élèves, emploi du temps | Tenant |
| 3 | Console : gestion du cycle de vie des tenants + vue "fleet" | Super Admin |
| 4 | Tenant : notes, bulletins, absences | Tenant |
| 5 | Console : abonnements & facturation SaaS (dont essai 7 jours), activation des modules | Super Admin |
| 6 | Tenant : finances/facturation établissement | Tenant |
| 7 | Console : support, impersonation, monitoring technique | Super Admin |
| 8 | Tenant : modules différenciants vague 1 et 2 (offline/SMS, engagement parents) | Tenant |
| 9 | Console : analytics & pilotage stratégique, gestion des utilisateurs internes/2FA | Super Admin |
| 10 | Tenant : vagues 3 à 5 selon priorisation commerciale | Tenant |
| 11 | Durcissement production : sécurité, tests de charge, audit RGPD complet sur les deux espaces | Commun |

---

## 7. CHECKLIST FINALE AVANT PRODUCTION (les deux espaces)

- [ ] Isolation tenant vérifiée par tests automatisés sur 100% des endpoints `/tenant/*`
- [ ] Aucun endpoint `/platform/*` accessible sans vérification explicite du rôle interne
- [ ] 2FA obligatoire et non contournable sur tous les comptes de la console super admin
- [ ] Mot de passe du compte Super Admin seed changé depuis sa valeur initiale, et 2FA activé sur ce compte avant toute mise en production
- [ ] Journal d'audit non modifiable couvrant les actions sensibles des deux espaces
- [ ] Impersonation tracée, limitée dans le temps, visuellement signalée en permanence
- [ ] Design system v2 unifié respecté sur les deux espaces (même palette, même typographie, distinction par contenu uniquement)
- [ ] Variables CSS partagées appliquées — aucune valeur de couleur codée en dur
- [ ] Filigrane scolaire SVG présent uniquement sur les zones de respiration, jamais sur les données
- [ ] Exports Excel/PDF cohérents et fonctionnels sur les deux espaces
- [ ] Sauvegardes, monitoring, plan de restauration testés
- [ ] Vue "fleet" testée avec un volume réaliste de tenants (scalabilité visuelle et technique)

---

*Ce document est le référentiel fonctionnel et architectural de KPSyDesk School.
La charte graphique complète est dans le fichier séparé :
`kpsydesk-school-design-v2-moderne-futuriste.md`*
