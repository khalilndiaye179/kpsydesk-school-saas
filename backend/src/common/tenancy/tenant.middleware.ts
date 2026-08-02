import { BadRequestException, ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { getJwtSecret } from '../config/jwt.config';
import { isValidTenantId } from './tenant-id';

// Context de stockage asynchrone pour propager le tenant_id de la requête HTTP
export const tenantLocalStorage = new AsyncLocalStorage<string>();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const headerTenantId = req.headers['x-tenant-id'];

    if (headerTenantId !== undefined && !isValidTenantId(headerTenantId)) {
      throw new BadRequestException("L'entête x-tenant-id doit être un UUID valide.");
    }

    // Le tenant du jeton signé fait autorité ; l'entête n'est utilisée que pour les
    // requêtes non authentifiées (ex: login tenant) où aucun jeton n'existe encore.
    const tokenTenantId = this.extractTenantIdFromToken(req);

    if (tokenTenantId && headerTenantId && headerTenantId !== tokenTenantId) {
      throw new ForbiddenException("L'entête x-tenant-id ne correspond pas au jeton fourni.");
    }

    const tenantId = tokenTenantId ?? (headerTenantId as string | undefined);

    if (tenantId) {
      tenantLocalStorage.run(tenantId, () => {
        next();
      });
    } else {
      next();
    }
  }

  private extractTenantIdFromToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }

    try {
      const payload = this.jwtService.verify<Record<string, any>>(
        authHeader.slice('Bearer '.length).trim(),
        { secret: getJwtSecret() },
      );
      return isValidTenantId(payload.tenantId) ? payload.tenantId : undefined;
    } catch {
      // Jeton invalide : aucun contexte tenant n'est ouvert, les guards rejetteront la requête.
      return undefined;
    }
  }
}
