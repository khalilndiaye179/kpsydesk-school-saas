import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    // runWithTenantContext applique le RLS PostgreSQL ; le filtre explicite garantit
    // l'isolation même si les policies ne sont pas actives sur la connexion courante.
    return this.prisma.runWithTenantContext(async (tx) => {
      return tx.student.findMany({
        where: { tenantId },
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
          tenantId: tenantId,
        }
      });
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.runWithTenantContext(async (tx) => {
      const student = await tx.student.findFirst({
        where: { id, tenantId },
        include: { class: true }
      });
      if (!student) throw new NotFoundException('Élève non trouvé');
      return student;
    });
  }
}
