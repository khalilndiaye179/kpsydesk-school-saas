import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { TenantSettingsService, SaveTenantSettingsDto } from './tenant-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('tenant/settings')
export class TenantSettingsController {
  constructor(private readonly settingsService: TenantSettingsService) {}

  @Get()
  async getSettings(@Req() req: Request) {
    const tenantId = (req as any).user.tenantId;
    return this.settingsService.getSettings(tenantId);
  }

  @Put()
  async updateSettings(@Body() body: SaveTenantSettingsDto, @Req() req: Request) {
    const tenantId = (req as any).user.tenantId;
    return this.settingsService.updateSettings(tenantId, body);
  }
}
