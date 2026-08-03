import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.student.findMany({
      where: { tenantId },
      include: { class: true },
      orderBy: { lastName: 'asc' },
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.student.create({
      data: {
        ...data,
        tenantId: tenantId,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: { class: true },
    });
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }
}
