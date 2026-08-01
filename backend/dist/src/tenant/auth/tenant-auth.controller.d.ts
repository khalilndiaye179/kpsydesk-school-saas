import { TenantAuthService } from './tenant-auth.service';
export declare class TenantAuthController {
    private authService;
    constructor(authService: TenantAuthService);
    login(loginDto: {
        email: string;
        pass: string;
    }, tenantId: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
}
