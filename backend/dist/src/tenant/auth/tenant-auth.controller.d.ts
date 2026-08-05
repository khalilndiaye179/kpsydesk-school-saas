import { TenantAuthService } from './tenant-auth.service';
export declare class TenantAuthController {
    private authService;
    constructor(authService: TenantAuthService);
    login(loginDto: {
        username: string;
        pass: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.TenantRole;
            tenantId: string;
            firstName: string;
            lastName: string;
        };
    }>;
}
