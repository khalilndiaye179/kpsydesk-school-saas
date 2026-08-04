import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface SaveTenantSettingsDto {
  schoolName?: string;
  ministry?: string;
  ia?: string;
  motto?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  kioskLatitude?: string | number;
  kioskLongitude?: string | number;
  kioskToleranceMeters?: number;
  kioskRequirePhoto?: boolean;
  kioskPhotoRetentionDays?: number;
}

@Injectable()
export class TenantSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Établissement non trouvé (ID: ${tenantId})`);
    }

    // Récupération ou initialisation automatique des paramètres
    let settings = tenant.settings;
    if (!settings) {
      settings = await this.prisma.tenantSettings.create({
        data: {
          tenantId,
          kioskToleranceMeters: 150,
          kioskRequirePhoto: true,
          kioskPhotoRetentionDays: 30,
        },
      });
    }

    return {
      schoolName: tenant.name,
      country: tenant.country,
      ministry: settings.ministry || '',
      ia: settings.ia || '',
      motto: settings.motto || '',
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || '',
      logo: settings.logo || '',
      kioskLatitude: settings.kioskLatitude !== null ? String(settings.kioskLatitude) : '',
      kioskLongitude: settings.kioskLongitude !== null ? String(settings.kioskLongitude) : '',
      kioskToleranceMeters: settings.kioskToleranceMeters ?? 150,
      kioskRequirePhoto: settings.kioskRequirePhoto ?? true,
      kioskPhotoRetentionDays: settings.kioskPhotoRetentionDays ?? 30,
    };
  }

  async updateSettings(tenantId: string, dto: SaveTenantSettingsDto) {
    // 1. Mettre à jour le nom du Tenant si renseigné
    if (dto.schoolName) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { name: dto.schoolName },
      });
    }

    // 2. Mettre à jour ou créer les TenantSettings
    const kioskLat = dto.kioskLatitude !== undefined && dto.kioskLatitude !== '' ? parseFloat(String(dto.kioskLatitude)) : null;
    const kioskLng = dto.kioskLongitude !== undefined && dto.kioskLongitude !== '' ? parseFloat(String(dto.kioskLongitude)) : null;

    const settings = await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      update: {
        ministry: dto.ministry,
        ia: dto.ia,
        motto: dto.motto,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        logo: dto.logo,
        kioskLatitude: kioskLat,
        kioskLongitude: kioskLng,
        kioskToleranceMeters: dto.kioskToleranceMeters !== undefined ? Number(dto.kioskToleranceMeters) : undefined,
        kioskRequirePhoto: dto.kioskRequirePhoto,
        kioskPhotoRetentionDays: dto.kioskPhotoRetentionDays !== undefined ? Number(dto.kioskPhotoRetentionDays) : undefined,
      },
      create: {
        tenantId,
        ministry: dto.ministry,
        ia: dto.ia,
        motto: dto.motto,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        logo: dto.logo,
        kioskLatitude: kioskLat,
        kioskLongitude: kioskLng,
        kioskToleranceMeters: dto.kioskToleranceMeters !== undefined ? Number(dto.kioskToleranceMeters) : 150,
        kioskRequirePhoto: dto.kioskRequirePhoto ?? true,
        kioskPhotoRetentionDays: dto.kioskPhotoRetentionDays !== undefined ? Number(dto.kioskPhotoRetentionDays) : 30,
      },
    });

    return this.getSettings(tenantId);
  }
}
