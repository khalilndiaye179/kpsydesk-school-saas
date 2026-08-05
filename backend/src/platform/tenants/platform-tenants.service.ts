import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PlatformTenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'DIRECTOR' },
          select: { email: true, firstName: true, lastName: true, phone: true },
          take: 1,
        },
        _count: {
          select: { students: true, users: true },
        },
      },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      subdomain: t.subdomain,
      plan: t.plan,
      status: t.status,
      createdAt: t.createdAt,
      studentsCount: t._count.students,
      usersCount: t._count.users,
      contactEmail: t.users[0]?.email ?? null,
      contactName: t.users[0]
        ? `${t.users[0].firstName ?? ''} ${t.users[0].lastName ?? ''}`.trim()
        : null,
      contactPhone: t.users[0]?.phone ?? null,
    }));
  }

  async updateStatus(tenantId: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }

  async create(data: { name: string; email: string; plan?: any }) {
    const subdomain = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const { generateTenantCodeSlug } = require('../../common/utils/tenant-code.util');
    let baseCode = generateTenantCodeSlug(data.name);
    let code = baseCode;
    let codeIndex = 1;

    // Détection des collisions de code tenant
    while (await this.prisma.tenant.findUnique({ where: { code } })) {
      code = `${baseCode}${codeIndex}`;
      codeIndex++;
    }

    const bcrypt = require('bcryptjs');
    const defaultPassHash = await bcrypt.hash('KPsySchool2026!', 12);
    const initialUsername = `${code}-0001`;

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        code,
        subdomain,
        plan: data.plan || 'PRO',
        status: 'ACTIVE',
        users: {
          create: {
            username: initialUsername,
            email: data.email.trim().toLowerCase(),
            passwordHash: defaultPassHash,
            role: 'DIRECTOR',
            firstName: 'Directeur',
            lastName: 'Principal',
          },
        },
      },
    });
  }

  async updatePlan(tenantId: string, plan: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { plan },
    });
  }

  async resetAdminPassword(tenantId: string) {
    const adminUser = await this.prisma.tenantUser.findFirst({
      where: { tenantId, role: 'DIRECTOR' },
    });

    if (!adminUser) {
      throw new Error("Aucun administrateur/directeur trouvé pour cet établissement.");
    }

    // Génération d'un mot de passe temporaire lisible (ex: KPsy-928471)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const tempPassword = `KPsy-${randomDigits}`;
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.tenantUser.update({
      where: { id: adminUser.id },
      data: { passwordHash },
    });

    return {
      adminEmail: adminUser.email,
      adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
      tempPassword,
    };
  }

  async purgeTenant(tenantId: string) {
    // Suppression en cascade du tenant (gérée par le schéma Prisma onDelete: Cascade)
    return this.prisma.tenant.delete({
      where: { id: tenantId },
    });
  }
}
