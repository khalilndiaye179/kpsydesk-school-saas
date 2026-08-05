import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlatformJwtGuard } from '../../common/guards/platform-jwt.guard';
import { PlatformStatsService } from './platform-stats.service';

@Controller('platform/stats')
@UseGuards(PlatformJwtGuard)
export class PlatformStatsController {
  constructor(private readonly service: PlatformStatsService) {}

  /**
   * GET /platform/stats/global
   * Appelé toutes les 30 secondes par le SuperAdmin Dashboard pour un rafraîchissement en temps réel.
   */
  @Get('global')
  getGlobalStats() {
    return this.service.getGlobalStats();
  }
}
