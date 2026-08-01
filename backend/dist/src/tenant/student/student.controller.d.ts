import { StudentService } from './student.service';
import { Request } from 'express';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    findAll(): Promise<any>;
    create(createStudentDto: any, request: Request): Promise<any>;
    findOne(id: string): Promise<any>;
}
