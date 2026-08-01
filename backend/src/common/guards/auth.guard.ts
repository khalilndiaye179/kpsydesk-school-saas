import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = authHeader.split(' ')[1];
    
    // Simplification pour le prototype
    if (token === 'fake-jwt-token-superadmin' || token === 'fake-jwt-token-tenant') {
      // Dans un vrai projet, on décode le JWT et on attache l'utilisateur (req.user = payload)
      request['user'] = { 
        id: 'user-id', 
        role: token.includes('superadmin') ? 'SUPER_ADMIN' : 'TENANT_ADMIN',
        tenantId: token.includes('superadmin') ? null : request.headers['x-tenant-id']
      };
      return true;
    }

    throw new UnauthorizedException('Token invalide');
  }
}
