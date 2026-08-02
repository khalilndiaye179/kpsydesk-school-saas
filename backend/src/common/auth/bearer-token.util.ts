import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extrait le jeton d'un entête "Authorization: Bearer <token>".
 */
export function extractBearerToken(
  request: Request,
  missingTokenMessage = 'Token manquant ou invalide',
): string {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException(missingTokenMessage);
  }

  return authHeader.slice('Bearer '.length);
}
