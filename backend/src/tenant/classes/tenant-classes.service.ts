import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return await tx.class.findMany({
        where: { tenantId },
        include: { _count: { select: { students: true } } }
      });
    });
  }

  async create(name: string, code: string, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return await tx.class.create({
        data: {
          name,
          code,
          tenantId,
        },
      });
    });
  }
}
