import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class TenantAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(usernameInput: string, pass: string): Promise<{
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
