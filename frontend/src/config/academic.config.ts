/**
 * MOTEUR ACADÉMIQUE CENTRAL (ACADEMIC CORE ENGINE)
 * Référentiel des Cycles, Niveaux, Séries, Matières & Coefficients Officiels
 * Sénégal 🇸🇳 · Côte d'Ivoire 🇨🇮 · Mali 🇲🇱 · Extensibilité CEDEAO
 */

export interface SubjectConfig {
  code: string;
  name: string;
  category: 'LITTERAIRE' | 'SCIENTIFIQUE' | 'HUMAINE' | 'ARTISTIQUE' | 'TECHNIQUE' | 'SPORT';
  defaultCoefficient: number;
  isOptional?: boolean;
}

export interface SeriesConfig {
  code: string;           // ex: 'S2', 'L2', 'A', 'C', 'D', 'SET'
  name: string;           // ex: 'Série S2 - Sciences Expérimentales'
  description?: string;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    coefficient: number;
    isOptional?: boolean;
  }>;
}

export interface AcademicLevelConfig {
  code: string;           // ex: '6EME', '3EME', '2NDE', 'TLE'
  name: string;           // ex: 'Terminale'
  cycle: 'COLLEGE' | 'LYCEE';
  availableSeries?: SeriesConfig[];
  defaultSubjects?: Array<{
    subjectCode: string;
    subjectName: string;
    coefficient: number;
  }>;
}

export interface CountryAcademicConfig {
  countryCode: string;
  countryName: string;
  flag: string;
  levels: AcademicLevelConfig[];
  optionalSubjects: SubjectConfig[];
}

export const ACADEMIC_REGISTRY: Record<string, CountryAcademicConfig> = {
  // ---------------------------------------------------------------------------
  // SÉNÉGAL 🇸🇳
  // ---------------------------------------------------------------------------
  SN: {
    countryCode: 'SN',
    countryName: 'Sénégal',
    flag: '🇸🇳',
    optionalSubjects: [
      { code: 'ESP', name: 'Espagnol (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'ALL', name: 'Allemand (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'ARA', name: 'Arabe (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'ITA', name: 'Italien (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'INFO', name: 'Informatique & Algorithmique', category: 'TECHNIQUE', defaultCoefficient: 2, isOptional: true },
      { code: 'DESSIN', name: 'Dessin & Arts Plastiques', category: 'ARTISTIQUE', defaultCoefficient: 1, isOptional: true },
      { code: 'MUS', name: 'Éducation Musicale', category: 'ARTISTIQUE', defaultCoefficient: 1, isOptional: true },
      { code: 'WOLOF', name: 'Langue Nationale Wolof', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
    ],
    levels: [
      // --- COLLÈGE SÉNÉGAL ---
      {
        code: '6EME',
        name: 'Sixième (6ème)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'FRA', subjectName: 'Français', coefficient: 5 },
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'Sciences de la Vie et de la Terre (SVT)', coefficient: 2 },
          { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 3 },
          { subjectCode: 'EPS', subjectName: 'Éducation Physique & Sportive (EPS)', coefficient: 2 },
          { subjectCode: 'EDHC', subjectName: 'Éducation aux Droits & à la Citoyenneté', coefficient: 1 },
        ],
      },
      {
        code: '5EME',
        name: 'Cinquième (5ème)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'FRA', subjectName: 'Français', coefficient: 5 },
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 2 },
          { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 3 },
          { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
        ],
      },
      {
        code: '4EME',
        name: 'Quatrième (4ème)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'FRA', subjectName: 'Français', coefficient: 5 },
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 2 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 3 },
          { subjectCode: 'LV2', subjectName: 'Langue Vivante 2 (Espagnol/Arabe/Allemand)', coefficient: 3 },
          { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
        ],
      },
      {
        code: '3EME',
        name: 'Troisième (3ème - BFEM)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'FRA', subjectName: 'Français (Compo & Dictée)', coefficient: 5 },
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 3 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
          { subjectCode: 'LV2', subjectName: 'LV2 (Espagnol/Arabe/Allemand)', coefficient: 3 },
          { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
        ],
      },

      // --- LYCÉE SÉNÉGAL (SÉRIES L1, L2, S1, S2, G, T) ---
      {
        code: '2NDE',
        name: 'Seconde (2nde)',
        cycle: 'LYCEE',
        availableSeries: [
          {
            code: '2NDE_L',
            name: 'Seconde L (Littéraire)',
            subjects: [
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 5 },
              { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 4 },
              { subjectCode: 'LV2', subjectName: 'LV2 (Espagnol/Allemand/Arabe)', coefficient: 4 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 4 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 2 },
              { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 2 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
          {
            code: '2NDE_S',
            name: 'Seconde S (Scientifique)',
            subjects: [
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 6 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 5 },
              { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 4 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
        ],
      },
      {
        code: 'TLE',
        name: 'Terminale (Tle - Baccalauréat)',
        cycle: 'LYCEE',
        availableSeries: [
          {
            code: 'S2',
            name: 'Série S2 (Sciences Expérimentales)',
            subjects: [
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 8 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 7 },
              { subjectCode: 'SVT', subjectName: 'Sciences de la Vie & de la Terre', coefficient: 6 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 2 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
          {
            code: 'S1',
            name: 'Série S1 (Mathématiques & Sciences Physiques)',
            subjects: [
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 9 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 8 },
              { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 3 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 2 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
          {
            code: 'L2',
            name: 'Série L2 (Sciences Humaines & Littérature)',
            subjects: [
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 6 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 5 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 5 },
              { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 4 },
              { subjectCode: 'LV2', subjectName: 'LV2 (Espagnol/Allemand/Arabe)', coefficient: 4 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
          {
            code: 'L1',
            name: 'Série L1 (Langues & Civilisations)',
            subjects: [
              { subjectCode: 'FRA', subjectName: 'Français / Lettres', coefficient: 6 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 5 },
              { subjectCode: 'ANG', subjectName: 'Anglais (LV1)', coefficient: 5 },
              { subjectCode: 'LV2', subjectName: 'LV2 (Espagnol/Allemand/Arabe)', coefficient: 5 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 4 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
          {
            code: 'G',
            name: 'Série G (Gestion & Comptabilité)',
            subjects: [
              { subjectCode: 'COMPTA', subjectName: 'Comptabilité & Financial Mgmt', coefficient: 7 },
              { subjectCode: 'ECO', subjectName: 'Économie & Droit', coefficient: 6 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques de Gestion', coefficient: 5 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'ANG', subjectName: 'Anglais commercial', coefficient: 4 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // CÔTE D'IVOIRE 🇨🇮
  // ---------------------------------------------------------------------------
  CI: {
    countryCode: 'CI',
    countryName: "Côte d'Ivoire",
    flag: '🇨🇮',
    optionalSubjects: [
      { code: 'ALL', name: 'Allemand (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'ESP', name: 'Espagnol (LV2)', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'INFO', name: 'Informatique & TIC', category: 'TECHNIQUE', defaultCoefficient: 2, isOptional: true },
      { code: 'ARTS', name: 'Arts Plastiques', category: 'ARTISTIQUE', defaultCoefficient: 1, isOptional: true },
    ],
    levels: [
      {
        code: '3EME',
        name: 'Troisième (3ème - BEPC)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'FRA', subjectName: 'Composition Française & Orthographe', coefficient: 4 },
          { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 3 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
          { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
        ],
      },
      {
        code: 'TLE',
        name: 'Terminale (Tle - Baccalauréat Ivoirien)',
        cycle: 'LYCEE',
        availableSeries: [
          {
            code: 'A',
            name: 'Série A (Littéraire)',
            subjects: [
              { subjectCode: 'FRA', subjectName: 'Français / Littérature', coefficient: 5 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 5 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 4 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 4 },
              { subjectCode: 'LV2', subjectName: 'LV2 (Espagnol / Allemand)', coefficient: 3 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 1 },
            ],
          },
          {
            code: 'C',
            name: 'Série C (Mathématiques & Physique)',
            subjects: [
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 8 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 7 },
              { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 3 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 2 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 1 },
            ],
          },
          {
            code: 'D',
            name: 'Série D (Sciences Naturelles & Mathématiques)',
            subjects: [
              { subjectCode: 'SVT', subjectName: 'SVT', coefficient: 6 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 6 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 5 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 2 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 2 },
              { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MALI 🇲🇱
  // ---------------------------------------------------------------------------
  ML: {
    countryCode: 'ML',
    countryName: 'Mali',
    flag: '🇲🇱',
    optionalSubjects: [
      { code: 'ARABE', name: 'Langue Arabe', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
      { code: 'BAMBARA', name: 'Langue Nationale Bambara', category: 'LITTERAIRE', defaultCoefficient: 2, isOptional: true },
    ],
    levels: [
      {
        code: 'DEF',
        name: '9ème Année (DEF - Diplôme d\'Études Fondamentales)',
        cycle: 'COLLEGE',
        defaultSubjects: [
          { subjectCode: 'FRA', subjectName: 'Rédaction & Dictée', coefficient: 4 },
          { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
          { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 3 },
          { subjectCode: 'SVT', subjectName: 'Biologie - Géologie', coefficient: 3 },
          { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 3 },
          { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
          { subjectCode: 'ECM', subjectName: 'Éducation Civique & Morale', coefficient: 2 },
        ],
      },
      {
        code: 'TLE',
        name: 'Terminale (Tle - Baccalauréat Malien)',
        cycle: 'LYCEE',
        availableSeries: [
          {
            code: 'TSEXP',
            name: 'Série TSExp (Sciences Expérimentales)',
            subjects: [
              { subjectCode: 'SVT', subjectName: 'Biologie / SVT', coefficient: 7 },
              { subjectCode: 'PC', subjectName: 'Physique - Chimie', coefficient: 6 },
              { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 5 },
              { subjectCode: 'FRA', subjectName: 'Français', coefficient: 3 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 3 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
            ],
          },
          {
            code: 'LL',
            name: 'Série LL (Lettres & Littérature)',
            subjects: [
              { subjectCode: 'FRA', subjectName: 'Littérature & Français', coefficient: 6 },
              { subjectCode: 'PHILOSOPHIE', subjectName: 'Philosophie', coefficient: 5 },
              { subjectCode: 'HG', subjectName: 'Histoire - Géographie', coefficient: 4 },
              { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 4 },
              { subjectCode: 'LV2', subjectName: 'LV2 (Arabe / Russe / Allemand)', coefficient: 3 },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Obtenir la configuration académique d'un pays avec fallback SN (Sénégal)
 */
export function getCountryAcademicConfig(countryCode?: string): CountryAcademicConfig {
  const code = (countryCode || 'SN').toUpperCase();
  return ACADEMIC_REGISTRY[code] || ACADEMIC_REGISTRY['SN'];
}

/**
 * Obtenir la liste des matières obligatoires et coefficients pour un Niveau & Série donnés
 */
export function getSubjectsForClassSeries(countryCode: string, levelCode: string, seriesCode?: string) {
  const countryConfig = getCountryAcademicConfig(countryCode);
  const level = countryConfig.levels.find(l => l.code === levelCode || l.name.includes(levelCode));

  if (!level) return [];

  // Lycée avec Séries
  if (level.cycle === 'LYCEE' && level.availableSeries && seriesCode) {
    const series = level.availableSeries.find(s => s.code === seriesCode || s.name.includes(seriesCode));
    return series ? series.subjects : [];
  }

  // Collège par défaut
  return level.defaultSubjects || [];
}
