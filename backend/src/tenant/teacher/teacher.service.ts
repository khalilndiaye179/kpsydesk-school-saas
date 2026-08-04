import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.teacher.findMany({
      where: { tenantId },
      orderBy: { lastName: 'asc' },
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.teacher.create({
      data: {
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        specialty: data.specialty || '',
      },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });
    if (!teacher) throw new NotFoundException('Professeur non trouvé');

    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialty !== undefined) updateData.specialty = data.specialty;

    return this.prisma.teacher.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });
    if (!teacher) throw new NotFoundException('Professeur non trouvé');

    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
