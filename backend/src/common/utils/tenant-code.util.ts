/**
 * Génère un code d'établissement (CODE_TENANT) unique à partir de son nom.
 * Exemple: "Lycée Excellence de Dakar" -> "LYC-EDA" (ou "LED")
 */
export function generateTenantCodeSlug(name: string): string {
  if (!name || !name.trim()) return 'SCH';

  // 1. Supprimer les accents et caractères spéciaux
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toUpperCase();

  // Mots à ignorer
  const stopWords = ['DE', 'DU', 'DES', 'LA', 'LE', 'LES', 'ET', 'D', 'L', 'UN', 'UNE'];
  const words = clean.split(/\s+/).filter((w) => w.length > 0 && !stopWords.includes(w));

  let baseCode = '';

  if (words.length >= 3) {
    baseCode = words[0][0] + words[1][0] + words[2][0];
  } else if (words.length === 2) {
    baseCode = (words[0].substring(0, 2) + words[1][0]).substring(0, 3);
  } else if (words.length === 1 && words[0].length >= 3) {
    baseCode = words[0].substring(0, 3);
  } else {
    baseCode = (clean.replace(/\s+/g, '') + 'SCH').substring(0, 3);
  }

  return baseCode.toUpperCase();
}
