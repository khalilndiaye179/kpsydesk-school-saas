# Refonte Design — Charte Graphique "Moderne & Futuriste" (v2)
## Remplace la section 5 (et ajuste la section 0) du Prompt Maître KPSyDesk School

---

## 0. Principe directeur

La séparation initiale en deux chartes distinctes (Tenant "chaleureux académique"
vs Super Admin "cockpit marine") est abandonnée au profit d'**un seul système
visuel partagé**, inspiré de la capture de référence transmise (dashboard
sombre/blanc, cartes KPI épurées, donut + courbe, pastilles de statut
vert/rouge).

- **Console Super Admin** : reproduit directement la structure de la capture
  (sidebar pleine hauteur très sombre, topbar recherche + notifications +
  profil, rangée de cartes KPI, bloc donut + bloc courbe, tableau + liste
  d'activité).
- **Espace Tenant** : reprend exactement la même palette, la même typographie
  et la même structure de composants — seuls les libellés, les données et
  les icônes changent pour coller au métier scolaire.
- La distinction entre les deux espaces ne repose plus sur la couleur, mais
  sur : le contenu affiché, le nom affiché en haut de la sidebar
  (établissement vs "Console Super Admin"), et un léger repère visuel
  (badge de rôle sous le nom de l'utilisateur, comme "Seals Officer" dans la
  capture — ici "Directeur", "Comptable", "Support technique", etc.).
- Direction esthétique : **sobre, dense, futuriste** — noir/encre profond,
  blancs francs, aplats nets, aucune skeuomorphie. La touche "milieu
  scolaire" ne vient plus de couleurs chaudes académiques mais d'un
  **filigrane iconographique discret** (section 4).

---

## 1. Palette de couleurs (partagée, Tenant + Super Admin)

| Rôle | Valeur | Usage |
|---|---|---|
| Fond sidebar | `#0E1220` (encre quasi noire) | Sidebar pleine hauteur, les deux espaces |
| Sidebar — item actif | `#1B2033` | Fond de l'item de navigation sélectionné |
| Accent futuriste | `#5B6CFF` (indigo électrique) | Badge actif, liens, focus, boutons primaires |
| Accent secondaire (data) | `#22D3EE` (cyan) | Points de données, highlights de graphique, hover |
| Fond de page | `#F4F5FA` (blanc cassé froid, plus "tech" que la crème précédente) | Zone de contenu |
| Fond des cartes | `#FFFFFF` | Cartes KPI, blocs graphiques, tableaux |
| Positif / tendance haussière | `#16A34A` | Pastilles de statut, flèches de tendance |
| Négatif / tendance baissière | `#DC2626` | Pastilles de statut, flèches de tendance |
| Alerte / en essai (fleet, quotas) | `#D97706` (ambre) | Statuts intermédiaires uniquement |
| Texte principal | `#12131A` | Titres, chiffres clés |
| Texte secondaire | `#6B6E78` | Libellés, sous-titres, métadonnées |
| Bordures / séparateurs | `#E4E5EC` | Cartes, tableaux, séparateurs de sidebar |

Règle : toutes ces valeurs passent par des variables CSS
(`--bg-sidebar`, `--bg-sidebar-active`, `--accent`, `--accent-data`,
`--bg-page`, `--bg-card`, `--text-primary`, `--text-secondary`, `--border`,
`--status-positive`, `--status-negative`, `--status-warning`), jamais en
dur, pour être réutilisées identiquement dans les deux espaces.

---

## 2. Typographie

| Rôle | Police | Justification |
|---|---|---|
| Titres de section, chiffres héros des cartes KPI | **Space Grotesk** (700) | Géométrique, anguleuse, lisible en grand — apporte le côté "futuriste" que Fraunces (serif académique) ne donnait pas |
| Texte courant, navigation, tableaux | **Inter** (400/500) | Neutre, très lisible en petite taille, référence SaaS |
| Données tabulaires, montants, identifiants | **JetBrains Mono** (400) | Chiffres à chasse fixe pour l'alignement des colonnes financières et statistiques |

Abandon de Fraunces (trop académique/chaleureux) et d'IBM Plex Mono
(remplacé par JetBrains Mono, plus contemporain). Les chiffres clés des
cartes KPI restent le héros visuel de chaque carte : très grande taille,
graisse marquée, comme dans la capture ("$45,216.21").

---

## 3. Structure de page (sidebar, topbar, cartes, navigation)

Reproduction directe du squelette de la capture, appliqué identiquement
aux deux espaces :

1. **Sidebar pleine hauteur** (`--bg-sidebar`), largeur fixe, repliable :
   logo + nom du produit en haut, groupe "MENU PRINCIPAL" (libellés en gris
   clair, icône + texte), item actif surligné en `--bg-sidebar-active` avec
   icône encadrée d'un badge `--accent`. Groupe secondaire "PRÉFÉRENCES"
   séparé par une ligne fine, en bas de sidebar (Centre d'aide, Paramètres).
2. **Topbar** : titre de page à gauche, barre de recherche pilule au
   centre, icône notification, puis bloc profil (avatar + nom + rôle +
   chevron) à droite — identique à "Washim Shishr / Seals Officer" dans la
   capture, adapté en "Nom / Rôle".
3. **Bandeau de filtre de période** : sélecteur "Mensuel/Annuel", plage de
   dates affichée en clair, bouton d'export aligné à droite (fond
   `--text-primary` plein, texte blanc) — reprend le bouton "Export's CVS".
4. **Rangée de cartes KPI (3 à 4 cartes)** : icône dans un carré arrondi en
   haut à gauche, pastille de tendance (`+123.45%` vert / `-153.45%` rouge)
   en haut à droite, libellé discret, chiffre imposant en dessous. Fond
   blanc, coins arrondis ~16px, ombre très douce.
5. **Bloc double** : à gauche un donut/anneau de synthèse avec légende à
   barres de progression horizontales (ex. dans la capture : Fast
   Response/Fast Delivery/Feedback) ; à droite un graphique en courbe
   (Chart.js déjà en place) avec infobulle sombre au survol affichant
   valeur + date.
6. **Bloc bas en deux colonnes** : à gauche un tableau dense (produit →
   remplacé par l'entité métier pertinente, voir section 6) avec colonne
   de statut en pastille colorée ; à droite une liste d'activité récente
   (image/icône + libellé + horodatage + montant), avec lien "Tout voir".

---

## 4. Filigrane scolaire en arrière-plan (nouveauté demandée)

Pour ancrer visuellement le produit dans le milieu scolaire sans réutiliser
une palette chaude "académique", on introduit un **filigrane iconographique
discret** :

- Illustrations en **trait fin monochrome** (pas de photos, pas de couleur)
  : livre ouvert, mortier de diplômé, crayon, tableau noir, bâtiment
  scolaire stylisé, molécule/globe pour les matières scientifiques —
  vectorielles (SVG), style ligne continue épaisseur 1-1.5px.
- Opacité très faible (**4 à 8%**), couleur `--text-primary` ou `--accent`
  selon le fond, jamais un aplat de couleur vive.
- Zones d'application : fond de la zone d'en-tête du tableau de bord
  (derrière le titre "Tableau de bord"), écrans d'authentification (login,
  mot de passe oublié), états vides (aucune donnée, aucun résultat de
  recherche), écrans de chargement.
- Ne jamais appliquer ce filigrane sur les cartes KPI, les tableaux denses
  ou les graphiques eux-mêmes — il reste cantonné aux zones de respiration
  (arrière-plans, écrans de transition) pour ne pas nuire à la lisibilité
  des données.
- Un seul motif par écran à la fois, jamais un pattern répété façon papier
  peint — l'esprit reste minimaliste et technique, pas décoratif.

---

## 5. Éléments signature modifiés

| Élément | Ancienne version | Nouvelle version |
|---|---|---|
| Item de navigation actif | Aplat marine + badge doré | Fond `--bg-sidebar-active` + icône encadrée d'un badge `--accent` avec léger halo lumineux (glow doux, 4-6px, pas d'effet néon appuyé) |
| Onglets classe/promotion (Tenant) | "Onglets classeur" skeuomorphiques avec languette colorée | Contrôle segmenté plat (pill switcher), soulignement animé en `--accent` sous l'onglet actif — même idée de sélection, traitement plat et futuriste |
| Vue "fleet" (Super Admin) | Grille de statut compacte, codes couleur bruts | Cartes de statut compactes reprenant le style carte KPI de la capture, pastille de statut positionnée comme les pastilles de tendance (`Actif` vert, `À risque` ambre, `Suspendu` rouge, `Essai` indigo) |
| Graphique de synthèse | — | Donut en anneau (comme la capture), tracé `--text-primary` avec segment d'accent `--accent-data`, pourcentage central en Space Grotesk 700 |
| Boutons d'action principale | Fond marine plein | Fond `--text-primary` plein (noir/encre), texte blanc, coins ~10px — réutilisé pour tous les CTA de poids fort (export, création, confirmation) |

---

## 6. Adaptation par espace

### 6.1 Espace Tenant

- Cartes KPI : Effectif total, Taux de présence du jour, Recettes de
  scolarité encaissées, Bulletins générés ce trimestre.
- Donut de synthèse : taux de réussite / taux de recouvrement des frais /
  taux de satisfaction parents (barres de légende comme dans la capture).
- Courbe : évolution des inscriptions ou des encaissements sur l'année
  scolaire, infobulle sombre au survol d'un mois.
- Tableau dense (remplace "Best Selling Product") : classes à surveiller
  (décrochage, impayés) avec colonne statut en pastille (`À jour` vert /
  `Impayé` rouge).
- Liste d'activité (remplace "Recent Orders") : derniers paiements reçus,
  dernières absences signalées, avec horodatage relatif ("il y a 3 min").
- Filigrane plus présent ici (établissement = contexte "école" assumé) :
  livre ouvert, tableau noir, mortier.

### 6.2 Console Super Admin

- Cartes KPI : MRR, Nombre total de tenants actifs, Total facturé (FCFA),
  Taux de churn.
- Donut de synthèse : répartition des tenants par plan d'abonnement ou par
  type d'établissement.
- Courbe : évolution du MRR/ARR sur 12 mois, infobulle sombre au survol.
- Tableau dense : tenants à risque d'impayé ou de dépassement de quota,
  colonne statut en pastille (`Actif` vert / `Suspendu` rouge / `Essai`
  ambre).
- Liste d'activité : derniers tickets support, dernières activations de
  module, dernières impersonations (avec horodatage).
- Filigrane plus discret ici (contexte "cockpit" professionnel) : privilégier
  un motif abstrait de grille de données, éventuellement associé à un
  élément scolaire très stylisé (mortier minimal) pour garder la cohérence
  de marque sans alourdir l'écran.

---

## 7. Contraintes non négociables (mises à jour)

1. Périmètre strictement frontend (React/TypeScript/Vite) — pas de
   modification NestJS/Prisma/PostgreSQL/Docker, sauf ajustement mineur de
   configuration Vite pour les variables de thème (à proposer avant d'y
   toucher).
2. Réutiliser Chart.js, SheetJS et jsPDF déjà en place — aucune nouvelle
   librairie de graphique ou d'export.
3. Toutes les couleurs neutres et sémantiques passent par des variables CSS
   partagées entre les deux espaces — une seule feuille de variables de
   thème, pas une par espace.
4. Le filigrane scolaire (section 4) doit rester en SVG vectoriel léger,
   jamais en image raster lourde, et respecter les seuils d'opacité donnés.
5. Accessibilité : contraste suffisant entre texte et fonds (notamment
   texte clair sur sidebar sombre), ratio WCAG AA minimum, y compris pour
   les pastilles de statut colorées.
6. Ne pas casser les fonctionnalités existantes des deux espaces — c'est
   une refonte visuelle, pas une réécriture fonctionnelle.
7. Travailler section par section (variables de thème d'abord, puis
   sidebar/topbar, puis cartes KPI, puis graphiques, puis tableaux/listes),
   jamais une réécriture globale d'un coup. Montrer le rendu de chaque
   section avant de passer à la suivante.
8. **Rappel critique inversé** : contrairement à la version précédente du
   prompt, les deux espaces doivent maintenant **partager visuellement la
   même charte** — la distinction se fait par le contenu et le contexte
   affiché en sidebar/topbar, pas par une palette différente.

---

## 8. Bloc à donner tel quel à Antigravity

```
REFONTE VISUELLE UNIFIÉE — KPSyDesk School (Tenant + Super Admin)

Applique la nouvelle charte graphique suivante à l'ensemble des deux
espaces (Tenant et Console Super Admin), en remplacement de toute charte
précédente. Objectif : un style SaaS moderne et futuriste, sobre, dense,
inspiré d'un dashboard de référence (sidebar pleine hauteur très sombre
#0E1220, contenu sur fond blanc cassé #F4F5FA, cartes blanches à coins
arrondis ~16px, cartes KPI avec icône + pastille de tendance verte/rouge +
chiffre imposant, donut de synthèse + courbe Chart.js, tableau dense +
liste d'activité récente).

Palette (variables CSS à créer une seule fois, partagées) :
--bg-sidebar: #0E1220; --bg-sidebar-active: #1B2033; --accent: #5B6CFF;
--accent-data: #22D3EE; --bg-page: #F4F5FA; --bg-card: #FFFFFF;
--status-positive: #16A34A; --status-negative: #DC2626;
--status-warning: #D97706; --text-primary: #12131A;
--text-secondary: #6B6E78; --border: #E4E5EC.

Typographie : Space Grotesk 700 pour les titres et les chiffres héros des
cartes KPI, Inter 400/500 pour la navigation et le texte courant,
JetBrains Mono pour les données tabulaires/montants.

Structure commune : sidebar pleine hauteur + topbar (recherche, cloche,
profil) + rangée de cartes KPI + bloc donut/courbe + bloc tableau/liste
d'activité — appliquée à l'identique dans les deux espaces, seuls les
libellés et les données changent selon le contexte (scolaire pour le
Tenant, pilotage SaaS pour le Super Admin).

Ajoute un filigrane scolaire discret (livre, mortier, tableau noir,
crayon) en SVG vectoriel, opacité 4-8%, uniquement sur les zones de
respiration (en-tête du dashboard, écrans d'authentification, états vides,
chargement) — jamais sur les cartes, tableaux ou graphiques.

Ne touche à rien côté NestJS/Prisma/PostgreSQL/Docker. Réutilise Chart.js,
SheetJS et jsPDF déjà en place. Travaille section par section (variables
de thème, puis sidebar/topbar, puis cartes KPI, puis graphiques, puis
tableaux/listes) et montre le rendu de chaque section avant de continuer.
Confirme ta compréhension de cette charte avant de commencer à coder.
```

---

*Ce document remplace la section 5 (et ajuste la section 0) du prompt
maître consolidé KPSyDesk School. Les sections 1 à 4, 6 et 7 du document
d'origine restent inchangées.*
