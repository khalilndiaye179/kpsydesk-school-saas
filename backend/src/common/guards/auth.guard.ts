import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { getJwtSecret } from '../config/jwt.config';
import { isValidTenantId } from '../tenancy/tenant-id';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    let payload: Record<string, any>;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: getJwtSecret(),
      });
    } catch {
      throw new UnauthorizedException('Token invalide');
    }

    const isPlatformToken = payload.scope === 'platform';

    // Un jeton de portée restreinte (ex: "platform:enroll") ne donne accès à aucune ressource métier.
    if (payload.scope && !isPlatformToken) {
      throw new UnauthorizedException('Portée de jeton non autorisée pour cette ressource.');
    }

    if (!isPlatformToken && !isValidTenantId(payload.tenantId)) {
      throw new UnauthorizedException('Token sans contexte tenant valide');
    }

    // Le tenant provient exclusivement du jeton signé : l'entête x-tenant-id ne peut pas
    // servir à consulter les données d'un autre établissement.
    const headerTenantId = request.headers['x-tenant-id'];
    if (
      !isPlatformToken &&
      typeof headerTenantId === 'string' &&
      headerTenantId !== payload.tenantId
    ) {
      throw new ForbiddenException("L'entête x-tenant-id ne correspond pas au jeton fourni.");
    }

    request['user'] = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      scope: payload.scope ?? 'tenant',
      tenantId: isPlatformToken ? null : payload.tenantId,
    };

    return true;
  }
}
