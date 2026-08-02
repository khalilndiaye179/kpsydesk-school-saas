import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { extractBearerToken } from '../auth/bearer-token.util';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);

    // Simplification pour le prototype
    if (token === 'fake-jwt-token-superadmin' || token === 'fake-jwt-token-tenant') {
      // Dans un vrai projet, on décode le JWT et on attache l'utilisateur (req.user = payload)
      request.user = {
        id: 'user-id',
        role: token.includes('superadmin') ? 'SUPER_ADMIN' : 'TENANT_ADMIN',
        tenantId: token.includes('superadmin') ? null : (request.headers['x-tenant-id'] as string),
      };
      return true;
    }

    throw new UnauthorizedException('Token invalide');
  }
}
