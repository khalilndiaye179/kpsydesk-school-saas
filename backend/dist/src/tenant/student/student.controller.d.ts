import { StudentService } from './student.service';
import { Request } from 'express';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    findAll(request: Request): Promise<({
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
    create(createStudentDto: any, request: Request): Promise<{
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
    findOne(id: string, request: Request): Promise<{
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
    update(id: string, updateStudentDto: any, request: Request): Promise<{
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
    remove(id: string, request: Request): Promise<{
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
