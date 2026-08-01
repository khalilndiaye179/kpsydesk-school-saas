import { PrismaService } from '../../prisma.service';
export declare class StudentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    create(data: any, tenantId: string): Promise<any>;
    findOne(id: string): Promise<any>;
}
