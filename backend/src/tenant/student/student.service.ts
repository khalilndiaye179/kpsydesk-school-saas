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

  private async generateMatricule(tenantId: string): Promise<string> {
    const count = await this.prisma.student.count({ where: { tenantId } });
    return `ELEV${String(count + 1).padStart(5, '0')}`;
  }

  async create(data: any, tenantId: string) {
    const matricule = data.matricule || (await this.generateMatricule(tenantId));

    return this.prisma.student.create({
      data: {
        tenantId,
        classId: data.classId,
        matricule,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || data.studentEmail || null,
        studentPhone: data.studentPhone || null,
        studentEmail: data.studentEmail || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
        birthPlace: data.birthPlace || null,
        previousSchool: data.previousSchool || null,
        address: data.address || null,
        guardianName: data.guardianName || null,
        guardianRelation: data.guardianRelation || null,
        guardianPhone: data.guardianPhone || null,
        guardianEmail: data.guardianEmail || null,
      },
      include: { class: true },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) throw new NotFoundException('Élève non trouvé');

    const updateData: any = {};
    if (data.classId) updateData.classId = data.classId;
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.birthDate) updateData.birthDate = new Date(data.birthDate);
    if (data.matricule !== undefined) updateData.matricule = data.matricule;
    if (data.studentPhone !== undefined) updateData.studentPhone = data.studentPhone;
    if (data.studentEmail !== undefined) {
      updateData.studentEmail = data.studentEmail;
      updateData.email = data.studentEmail;
    }
    if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace;
    if (data.previousSchool !== undefined) updateData.previousSchool = data.previousSchool;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.guardianName !== undefined) updateData.guardianName = data.guardianName;
    if (data.guardianRelation !== undefined) updateData.guardianRelation = data.guardianRelation;
    if (data.guardianPhone !== undefined) updateData.guardianPhone = data.guardianPhone;
    if (data.guardianEmail !== undefined) updateData.guardianEmail = data.guardianEmail;

    return this.prisma.student.update({
      where: { id },
      data: updateData,
      include: { class: true },
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

  async remove(id: string, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) throw new NotFoundException('Élève non trouvé');

    return this.prisma.student.delete({
      where: { id },
    });
  }
}
