import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // runWithTenantContext garantit que "SET LOCAL app.tenant_id" est injecté
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.student.findMany({
        include: { class: true },
        orderBy: { lastName: 'asc' }
      });
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.student.create({
        data: {
          ...data,
          tenantId: tenantId, // Assuré par le token / guard dans un cas réel
        }
      });
    });
  }

  async findOne(id: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id },
        include: { class: true }
      });
      if (!student) throw new NotFoundException('Élève non trouvé');
      return student;
    });
  }
}
