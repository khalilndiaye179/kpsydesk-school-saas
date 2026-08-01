import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.timetable.findMany({
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ],
        include: {
          class: true,
          course: true,
          teacher: true
        }
      });
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.timetable.create({
        data: {
          ...data,
          tenantId: tenantId,
        }
      });
    });
  }
}
