export interface CountryConfig {
  code: string;                  // 'SN', 'CI', 'ML', 'TG', 'BJ', 'BF', 'NE', 'GW'
  name: string;                  // Ex: "Côte d'Ivoire"
  flag: string;                  // Ex: "🇨🇮"
  callingCode: string;           // Ex: "+225"
  isActive: boolean;             // Phase 3: true pour SN, CI, ML | false pour TG, BJ, BF, NE, GW
  currency: {
    code: string;                // 'XOF'
    symbol: string;              // 'FCFA'
    position: 'AFTER' | 'BEFORE';
  };
  phone: {
    placeholder: string;
    example: string;
  };
  tax: {
    authorityName: string;       // DGI, OTR, DGCI
    taxIdLabel: string;          // NINEA, NCC, NIF
  };
  socialSecurity: {
    pensionOrganism: string;     // IPRES, CNPS, INPS, CNSS, INSS
  };
  officialHeader: {
    republicName: string;
    motto: string;
  };
  mobileMoneyProviders: Array<{
    id: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'TMONEY' | 'AIRTEL_MONEY';
    name: string;
    iconColor: string;
  }>;
}

export const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  SN: {
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    callingCode: '+221',
    isActive: true,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '77 123 45 67', example: '+221 77 123 45 67' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'NINEA' },
    socialSecurity: { pensionOrganism: 'IPRES / CSS' },
    officialHeader: { republicName: 'RÉPUBLIQUE DU SÉNÉGAL', motto: 'Un Peuple - Un But - Une Foi' },
    mobileMoneyProviders: [
      { id: 'WAVE', name: 'Wave Sénégal', iconColor: '#38bdf8' },
      { id: 'ORANGE_MONEY', name: 'Orange Money Sénégal', iconColor: '#f97316' },
    ],
  },
  CI: {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    callingCode: '+225',
    isActive: true,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '07 12 34 56 78', example: '+225 07 12 34 56 78' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'NCC (N° Compte Contribuable)' },
    socialSecurity: { pensionOrganism: 'CNPS' },
    officialHeader: { republicName: "RÉPUBLIQUE DE CÔTE D'IVOIRE", motto: 'Union - Discipline - Travail' },
    mobileMoneyProviders: [
      { id: 'WAVE', name: "Wave Côte d'Ivoire", iconColor: '#38bdf8' },
      { id: 'ORANGE_MONEY', name: "Orange Money Côte d'Ivoire", iconColor: '#f97316' },
    ],
  },
  ML: {
    code: 'ML',
    name: 'Mali',
    flag: '🇲🇱',
    callingCode: '+223',
    isActive: true,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '66 12 34 56', example: '+223 66 12 34 56' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'NIF' },
    socialSecurity: { pensionOrganism: 'INPS / CMSS' },
    officialHeader: { republicName: 'RÉPUBLIQUE DU MALI', motto: 'Un Peuple - Un But - Une Foi' },
    mobileMoneyProviders: [
      { id: 'ORANGE_MONEY', name: 'Orange Money Mali', iconColor: '#f97316' },
      { id: 'WAVE', name: 'Wave Mali', iconColor: '#38bdf8' },
    ],
  },
  TG: {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    callingCode: '+228',
    isActive: false,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '90 12 34 56', example: '+228 90 12 34 56' },
    tax: { authorityName: 'OTR (Office Togolais des Recettes)', taxIdLabel: 'NIF' },
    socialSecurity: { pensionOrganism: 'CNSS' },
    officialHeader: { republicName: 'RÉPUBLIQUE TOGOLAISE', motto: 'Travail - Liberté - Patrie' },
    mobileMoneyProviders: [
      { id: 'TMONEY', name: 'TMoney (Togocom)', iconColor: '#eab308' },
      { id: 'MOOV_MONEY', name: 'Flooz / Moov Money', iconColor: '#22c55e' },
    ],
  },
  BJ: {
    code: 'BJ',
    name: 'Bénin',
    flag: '🇧🇯',
    callingCode: '+229',
    isActive: false,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '97 12 34 56', example: '+229 97 12 34 56' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'IFU' },
    socialSecurity: { pensionOrganism: 'CNSS' },
    officialHeader: { republicName: 'RÉPUBLIQUE DU BÉNIN', motto: 'Fraternité - Justice - Travail' },
    mobileMoneyProviders: [
      { id: 'MTN_MONEY', name: 'MTN Mobile Money', iconColor: '#eab308' },
      { id: 'MOOV_MONEY', name: 'Moov Money', iconColor: '#22c55e' },
    ],
  },
  BF: {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    callingCode: '+226',
    isActive: false,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '70 12 34 56', example: '+226 70 12 34 56' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'IFU' },
    socialSecurity: { pensionOrganism: 'CNSS / CARFO' },
    officialHeader: { republicName: 'BURKINA FASO', motto: 'Unité - Progrès - Justice' },
    mobileMoneyProviders: [
      { id: 'ORANGE_MONEY', name: 'Orange Money Burkina', iconColor: '#f97316' },
      { id: 'MOOV_MONEY', name: 'Moov Money', iconColor: '#22c55e' },
    ],
  },
  NE: {
    code: 'NE',
    name: 'Niger',
    flag: '🇳🇪',
    callingCode: '+227',
    isActive: false,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '90 12 34 56', example: '+227 90 12 34 56' },
    tax: { authorityName: 'DGI (Direction Générale des Impôts)', taxIdLabel: 'NIF' },
    socialSecurity: { pensionOrganism: 'CNSS' },
    officialHeader: { republicName: 'RÉPUBLIQUE DU NIGER', motto: 'Fraternité - Travail - Progrès' },
    mobileMoneyProviders: [
      { id: 'AIRTEL_MONEY', name: 'Airtel Money', iconColor: '#ef4444' },
      { id: 'MOOV_MONEY', name: 'Moov Money', iconColor: '#22c55e' },
    ],
  },
  GW: {
    code: 'GW',
    name: 'Guinée-Bissau',
    flag: '🇬🇼',
    callingCode: '+245',
    isActive: false,
    currency: { code: 'XOF', symbol: 'FCFA', position: 'AFTER' },
    phone: { placeholder: '95 123 45 67', example: '+245 95 123 45 67' },
    tax: { authorityName: 'DGCI (Direcção-Geral das Contribuições e Impostos)', taxIdLabel: 'NIF' },
    socialSecurity: { pensionOrganism: 'INSS' },
    officialHeader: { republicName: 'REPÚBLICA DA GUINÉ-BISSAU', motto: 'Unidade - Luta - Progresso' },
    mobileMoneyProviders: [
      { id: 'ORANGE_MONEY', name: 'Orange Money Bissau', iconColor: '#f97316' },
      { id: 'MTN_MONEY', name: 'MTN Mobile Money (Spacetel)', iconColor: '#eab308' },
    ],
  },
};

/**
 * Obtenir la configuration d'un pays avec fallback sécurisé sur le Sénégal (SN)
 */
export function getCountryConfig(code?: string): CountryConfig {
  if (!code || !COUNTRY_REGISTRY[code.toUpperCase()]) {
    return COUNTRY_REGISTRY['SN'];
  }
  return COUNTRY_REGISTRY[code.toUpperCase()];
}

/**
 * Liste des pays actifs pour le signup et le paiement (SN, CI, ML)
 */
export const ACTIVE_COUNTRIES = Object.values(COUNTRY_REGISTRY).filter(c => c.isActive);

/**
 * Formater un montant en devise avec symbole du pays
 */
export function formatCurrency(amount: number, countryCode: string = 'SN'): string {
  const config = getCountryConfig(countryCode);
  const formatted = (amount || 0).toLocaleString('fr-FR');
  return `${formatted} ${config.currency.symbol}`;
}
