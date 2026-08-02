import { Module } from '@nestjs/common';
import { PlatformTenantsController } from './tenants/platform-tenants.controller';
import { PlatformTenantsService } from './tenants/platform-tenants.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PlatformTenantsController],
  providers: [PlatformTenantsService, PrismaService],
})
export class PlatformModule {}
