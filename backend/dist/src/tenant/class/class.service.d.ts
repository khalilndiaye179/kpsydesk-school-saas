import { PrismaService } from '../../prisma.service';
export declare class ClassService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    create(data: any, tenantId: string): Promise<any>;
}
