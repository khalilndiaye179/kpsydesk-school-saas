import { Module, Global } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';
import { MaintenanceGuard } from './maintenance.guard';
import { PrismaService } from '../../prisma.service';

@Global()
@Module({
  controllers: [SystemConfigController],
  providers: [SystemConfigService, MaintenanceGuard, PrismaService],
  exports: [SystemConfigService, MaintenanceGuard],
})
export class SystemConfigModule {}
