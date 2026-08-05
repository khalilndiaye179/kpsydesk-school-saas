import { PrismaService } from '../../prisma.service';
export declare class StudentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
        class: {
            id: string;
            name: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        firstName: string;
        lastName: string;
        address: string | null;
        classId: string;
        matricule: string | null;
        studentPhone: string | null;
        studentEmail: string | null;
        birthDate: Date;
        birthPlace: string | null;
        previousSchool: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
    })[]>;
    private generateMatricule;
    create(data: any, tenantId: string): Promise<{
        class: {
            id: string;
            name: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        firstName: string;
        lastName: string;
        address: string | null;
        classId: string;
        matricule: string | null;
        studentPhone: string | null;
        studentEmail: string | null;
        birthDate: Date;
        birthPlace: string | null;
        previousSchool: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
    }>;
    update(id: string, data: any, tenantId: string): Promise<{
        class: {
            id: string;
            name: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        firstName: string;
        lastName: string;
        address: string | null;
        classId: string;
        matricule: string | null;
        studentPhone: string | null;
        studentEmail: string | null;
        birthDate: Date;
        birthPlace: string | null;
        previousSchool: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        class: {
            id: string;
            name: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        firstName: string;
        lastName: string;
        address: string | null;
        classId: string;
        matricule: string | null;
        studentPhone: string | null;
        studentEmail: string | null;
        birthDate: Date;
        birthPlace: string | null;
        previousSchool: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        firstName: string;
        lastName: string;
        address: string | null;
        classId: string;
        matricule: string | null;
        studentPhone: string | null;
        studentEmail: string | null;
        birthDate: Date;
        birthPlace: string | null;
        previousSchool: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
    }>;
}
