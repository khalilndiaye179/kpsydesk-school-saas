import * as bcrypt from 'bcryptjs';

export const BCRYPT_ROUNDS = 12;
export const OTP_MAX_ATTEMPTS = 5;

/** Code de vérification à 6 chiffres. */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

export function compareSecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

export function expiresInMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
