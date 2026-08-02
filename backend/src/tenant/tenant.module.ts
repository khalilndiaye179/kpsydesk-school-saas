import { Module } from '@nestjs/common';
import { TenantAuthController } from './auth/tenant-auth.controller';
import { TenantAuthService } from './auth/tenant-auth.service';
import { TenantClassesController } from './classes/tenant-classes.controller';
import { TenantClassesService } from './classes/tenant-classes.service';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JWT_SECRET, TENANT_TOKEN_EXPIRATION } from '../common/config/jwt.config';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: TENANT_TOKEN_EXPIRATION },
    }),
  ],
  controllers: [TenantAuthController, TenantClassesController],
  providers: [TenantAuthService, TenantClassesService, PrismaService, JwtStrategy],
})
export class TenantModule {}
