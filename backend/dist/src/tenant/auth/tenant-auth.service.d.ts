import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class TenantAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(email: string, pass: string, tenantId: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
}
