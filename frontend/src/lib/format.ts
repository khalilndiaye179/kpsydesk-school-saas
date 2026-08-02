// Formatage localisé (fr-FR) partagé par les vues tenant et superadmin.

const LOCALE = 'fr-FR';

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

/** Montant en francs CFA, ex: formatAmount(45000) => "45 000 F". */
export function formatAmount(value: number | null | undefined, currency = 'F'): string {
  return `${formatNumber(Number(value) || 0)} ${currency}`;
}

export function formatDate(value: string | number | Date): string {
  return new Date(value).toLocaleDateString(LOCALE);
}

export function formatDateTime(value: string | number | Date): string {
  return new Date(value).toLocaleString(LOCALE);
}

/** Libellé de période, ex: "août 2026". */
export function formatMonthYear(value: string | number | Date = new Date()): string {
  return new Date(value).toLocaleString(LOCALE, { month: 'long', year: 'numeric' });
}
