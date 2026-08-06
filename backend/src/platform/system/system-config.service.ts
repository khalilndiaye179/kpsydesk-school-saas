import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);

  constructor(private prisma: PrismaService) {}

  async getConfig() {
    let config = await this.prisma.systemConfig.findUnique({
      where: { id: 'global' },
    });

    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          id: 'global',
          maintenanceMode: false,
          maintenanceMessage:
            'La plateforme KPSyDesk SaaS est actuellement en maintenance planifiée pour amélioration de nos services. Seuls les administrateurs globaux sont autorisés.',
        },
      });
    }

    return config;
  }

  async updateConfig(dto: { maintenanceMode?: boolean; maintenanceMessage?: string }) {
    const current = await this.getConfig();

    const updated = await this.prisma.systemConfig.update({
      where: { id: 'global' },
      data: {
        maintenanceMode: dto.maintenanceMode !== undefined ? dto.maintenanceMode : current.maintenanceMode,
        maintenanceMessage: dto.maintenanceMessage || current.maintenanceMessage,
      },
    });

    this.logger.warn(
      `MODE MAINTENANCE ${updated.maintenanceMode ? 'ACTIVÉ 🚨' : 'DÉSACTIVÉ ✅'} par le SuperAdmin.`,
    );

    return updated;
  }
}
