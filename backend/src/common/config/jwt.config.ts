const MIN_SECRET_LENGTH = 32;

/**
 * Retourne le secret JWT depuis l'environnement.
 * Aucune valeur par défaut n'est fournie : un secret présent dans le code source
 * ne constitue pas un secret.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET est absent ou trop court : définissez une valeur aléatoire d'au moins ${MIN_SECRET_LENGTH} caractères.`,
    );
  }

  return secret;
}
