/**
 * Valide si une chaîne est un UUID v4 valide.
 * Empêche tout risque d'injection SQL lors de l'interpolation dans SET LOCAL.
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid.trim());
}
