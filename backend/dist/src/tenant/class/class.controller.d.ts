import { ClassService } from './class.service';
import { Request } from 'express';
export declare class ClassController {
    private readonly classService;
    constructor(classService: ClassService);
    findAll(): Promise<any>;
    create(createClassDto: any, request: Request): Promise<any>;
}
