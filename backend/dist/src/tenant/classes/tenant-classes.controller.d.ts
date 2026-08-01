import { TenantClassesService } from './tenant-classes.service';
export declare class TenantClassesController {
    private classesService;
    constructor(classesService: TenantClassesService);
    findAll(): Promise<any>;
    create(body: {
        name: string;
        code: string;
    }): Promise<any>;
}
