import { Module } from '@nestjs/common';
import { PlatformBillingController } from './platform-billing.controller';
import { PlatformBillingService } from './platform-billing.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PlatformBillingController],
  providers: [PlatformBillingService, PrismaService],
  exports: [PlatformBillingService],
})
export class PlatformBillingModule {}
