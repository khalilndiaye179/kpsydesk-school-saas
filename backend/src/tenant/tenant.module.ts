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
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { EvaluationsController } from './evaluations/evaluations.controller';
import { EvaluationsService } from './evaluations/evaluations.service';
import { FinanceController } from './finance/finance.controller';
import { FinanceService } from './finance/finance.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
        }
        return {
          secret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  controllers: [
    TenantAuthController, 
    TenantClassesController, 
    TenantUsersController,
    TenantSettingsController,
    DashboardController,
    EvaluationsController,
    FinanceController,
  ],
  providers: [
    TenantAuthService, 
    TenantClassesService, 
    TenantUsersService, 
    TenantSettingsService,
    DashboardService,
    EvaluationsService,
    FinanceService,
    PrismaService, 
    JwtStrategy,
  ],
})
export class TenantModule {}
