import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.course.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' }
      });
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.course.create({
        data: {
          ...data,
          tenantId: tenantId,
        }
      });
    });
  }
}
