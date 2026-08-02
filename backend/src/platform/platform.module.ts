import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PlatformTenantsController } from './tenants/platform-tenants.controller';
import { PlatformTenantsService } from './tenants/platform-tenants.service';
import { PlatformAuthController } from './auth/platform-auth.controller';
import { PlatformAuthService } from './auth/platform-auth.service';
import { PlatformJwtGuard } from '../common/guards/platform-jwt.guard';
import { PrismaService } from '../prisma.service';
import { getJwtSecret } from '../common/config/jwt.config';

@Module({
  imports: [
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [PlatformTenantsController, PlatformAuthController],
  providers: [PlatformTenantsService, PlatformAuthService, PlatformJwtGuard, PrismaService],
  exports: [PlatformJwtGuard, JwtModule],
})
export class PlatformModule {}
