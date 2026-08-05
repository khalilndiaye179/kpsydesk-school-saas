import { TenantClassesService } from './tenant-classes.service';
import { Request } from 'express';
export declare class TenantClassesController {
    private classesService;
    constructor(classesService: TenantClassesService);
    findAll(req: Request): Promise<({
        _count: {
            students: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    })[]>;
    create(body: {
        name: string;
        code: string;
    }, req: Request): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
}
