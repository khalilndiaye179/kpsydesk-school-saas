import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { PlatformTenantsService } from './platform-tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('platform/tenants')
@UseGuards(AuthGuard)
export class PlatformTenantsController {
  constructor(private readonly service: PlatformTenantsService) {}

  /**
   * GET /api/v1/platform/tenants
   * Retourne la liste complète des tenants depuis PostgreSQL — SuperAdmin uniquement.
   */
  @Get()
  async findAll(@Request() req: any) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    return this.service.findAll();
  }

  /**
   * PATCH /api/v1/platform/tenants/:id/status
   * Met à jour le statut d'un tenant (ACTIVE, SUSPENDED, ARCHIVED) — SuperAdmin uniquement.
   */
  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED',
  ) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    if (!['ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
      throw new ForbiddenException('Statut invalide.');
    }
    return this.service.updateStatus(id, status);
  }
}
