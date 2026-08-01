import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
export declare const tenantLocalStorage: AsyncLocalStorage<string>;
export declare class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
