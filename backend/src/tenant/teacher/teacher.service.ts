import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.teacher.findMany({
        where: { tenantId },
        orderBy: { lastName: 'asc' }
      });
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.teacher.create({
        data: {
          ...data,
          tenantId: tenantId,
        }
      });
    });
  }
}
