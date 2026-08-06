import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { isValidUUID } from '../utils/uuid.util';

// Context de stockage asynchrone pour propager le tenant_id de la requête HTTP
export const tenantLocalStorage = new AsyncLocalStorage<string>();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Extraction et validation stricte du tenant ID depuis l'entête HTTP 'x-tenant-id'
    const rawTenantId = req.headers['x-tenant-id'] as string;

    if (rawTenantId && isValidUUID(rawTenantId)) {
      // 2. Propagation uniquement si le format UUID v4 est valide
      tenantLocalStorage.run(rawTenantId.trim(), () => {
        next();
      });
    } else {
      next();
    }
  }
}
