import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

// Context de stockage asynchrone pour propager le tenant_id de la requête HTTP
export const tenantLocalStorage = new AsyncLocalStorage<string>();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Extraction du tenant ID depuis l'entête HTTP 'x-tenant-id' (ou via le sous-domaine/JWT par la suite)
    const tenantId = req.headers['x-tenant-id'] as string;

    if (tenantId) {
      // 2. Propagation dans le scope asynchrone du thread de la requête
      tenantLocalStorage.run(tenantId, () => {
        next();
      });
    } else {
      next();
    }
  }
}
