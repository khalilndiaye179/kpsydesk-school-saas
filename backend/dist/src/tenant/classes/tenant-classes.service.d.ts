import { PrismaService } from '../../prisma.service';
export declare class TenantClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    create(name: string, code: string): Promise<any>;
}
