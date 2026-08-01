import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.runWithTenantContext(async (tx) => {
      return await tx.class.findMany({
        include: { _count: { select: { students: true } } }
      });
    });
  }

  async create(name: string, code: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      // tenantId injecté automatiquement dans les policies et récupéré du middleware
      const tenantId = tx.tenantId; // context RLS actif
      return await tx.class.create({
        data: {
          name,
          code,
        },
      });
    });
  }
}
