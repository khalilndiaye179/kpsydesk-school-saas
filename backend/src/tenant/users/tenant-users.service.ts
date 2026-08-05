import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.tenantUser.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        title: true,
        role: true,
        status: true,
        contractType: true,
        baseSalary: true,
        hourlyRate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Création d'un utilisateur d'établissement avec génération atomique du username {CODE_TENANT}-{SEQUENCE}
   */
  async create(data: any, tenantId: string) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.pass || 'KPsySchool2026!', 12);

    // 1. Récupérer le code du tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { code: true },
    });

    if (!tenant || !tenant.code) {
      throw new BadRequestException("Code établissement introuvable pour ce tenant.");
    }

    const tenantCode = tenant.code;

    // 2. Boucle de Retry Atomique Anti-Collision (jusqu'à 5 tentatives)
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;

      // Compter le nombre actuel d'utilisateurs du tenant pour proposer le prochain numéro de séquence
      const currentCount = await this.prisma.tenantUser.count({
        where: { tenantId },
      });

      const sequence = currentCount + attempt;
      const sequenceStr = String(sequence).padStart(4, '0');
      const candidateUsername = `${tenantCode}-${sequenceStr}`;

      try {
        const createdUser = await this.prisma.tenantUser.create({
          data: {
            tenantId,
            username: candidateUsername,
            email: data.email ? data.email.trim().toLowerCase() : `${candidateUsername.toLowerCase()}@kpsyschool.local`,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            title: data.title,
            role: data.role || 'TEACHER',
            status: 'ACTIVE',
            contractType: data.contractType || 'CDI',
            baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
            hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
          },
        });

        return createdUser;
      } catch (err: any) {
        // P2002 est l'erreur d'unicité Prisma : si doublon sur (tenantId, username), on incrémente et réessaie !
        if (err.code === 'P2002' && attempt < maxRetries) {
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestException("Impossible de générer un identifiant utilisateur unique. Veuillez réessayer.");
  }
}
