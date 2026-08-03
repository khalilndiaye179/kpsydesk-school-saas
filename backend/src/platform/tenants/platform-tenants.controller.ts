import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { PlatformTenantsService } from './platform-tenants.service';
import { PlatformJwtGuard } from '../../common/guards/platform-jwt.guard';

@Controller('platform/tenants')
@UseGuards(PlatformJwtGuard)
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
   * POST /api/v1/platform/tenants
   * Création et provisionnement manuel d'un tenant en BDD — SuperAdmin uniquement.
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() body: { name: string; email: string; plan?: string },
  ) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    return this.service.create(body);
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

  /**
   * PATCH /api/v1/platform/tenants/:id/plan
   * Redimensionne / affecte un plan SaaS à un tenant — SuperAdmin uniquement.
   */
  @Patch(':id/plan')
  async updatePlan(
    @Request() req: any,
    @Param('id') id: string,
    @Body('plan') plan: string,
  ) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    return this.service.updatePlan(id, plan);
  }

  /**
   * POST /api/v1/platform/tenants/:id/reset-password
   * Réinitialise le mot de passe de l'administrateur du tenant et renvoie le pass temporaire — SuperAdmin uniquement.
   */
  @Post(':id/reset-password')
  async resetAdminPassword(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    return this.service.resetAdminPassword(id);
  }

  /**
   * DELETE /api/v1/platform/tenants/:id
   * Purge définitivement un tenant et toutes ses données en cascade — SuperAdmin uniquement.
   */
  @Delete(':id')
  async purgeTenant(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux Super-Administrateurs.');
    }
    return this.service.purgeTenant(id);
  }
}
