import { PrismaService } from '../../prisma.service';
export declare class TenantClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
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
    create(name: string, code: string, tenantId: string): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
}
