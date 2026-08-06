import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { PlatformJwtGuard } from '../../common/guards/platform-jwt.guard';

@Controller('platform/system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  async getConfig() {
    return this.systemConfigService.getConfig();
  }

  @UseGuards(PlatformJwtGuard)
  @Patch()
  async updateConfig(
    @Body() body: { maintenanceMode?: boolean; maintenanceMessage?: string },
  ) {
    return this.systemConfigService.updateConfig(body);
  }
}
