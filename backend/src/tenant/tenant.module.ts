import { Module } from '@nestjs/common';
import { TenantAuthController } from './auth/tenant-auth.controller';
import { TenantAuthService } from './auth/tenant-auth.service';
import { TenantClassesController } from './classes/tenant-classes.controller';
import { TenantClassesService } from './classes/tenant-classes.service';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';

import { TenantUsersController } from './users/tenant-users.controller';
import { TenantUsersService } from './users/tenant-users.service';
import { TenantSettingsController } from './settings/tenant-settings.controller';
import { TenantSettingsService } from './settings/tenant-settings.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kpsydesk_jwt_super_secret_key_change_me_in_production',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    TenantAuthController, 
    TenantClassesController, 
    TenantUsersController,
    TenantSettingsController,
  ],
  providers: [
    TenantAuthService, 
    TenantClassesService, 
    TenantUsersService, 
    TenantSettingsService,
    PrismaService, 
    JwtStrategy,
  ],
})
export class TenantModule {}
