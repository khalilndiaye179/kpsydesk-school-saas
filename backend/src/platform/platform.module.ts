import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PlatformTenantsController } from './tenants/platform-tenants.controller';
import { PlatformTenantsService } from './tenants/platform-tenants.service';
import { PlatformAuthController } from './auth/platform-auth.controller';
import { PlatformAuthService } from './auth/platform-auth.service';
import { PlatformJwtGuard } from '../common/guards/platform-jwt.guard';
import { PrismaService } from '../prisma.service';
import { MfaModule } from './mfa/mfa.module';

@Module({
  imports: [
    MfaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kpsydesk_jwt_super_secret_key_change_me_in_production',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [PlatformTenantsController, PlatformAuthController],
  providers: [PlatformTenantsService, PlatformAuthService, PlatformJwtGuard, PrismaService],
  exports: [PlatformJwtGuard, JwtModule],
})
export class PlatformModule {}

