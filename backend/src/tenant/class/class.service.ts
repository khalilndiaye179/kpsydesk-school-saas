import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.class.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { students: true }
          }
        }
      });
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.class.create({
        data: {
          ...data,
          tenantId: tenantId,
        }
      });
    });
  }
}
