import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.teacher.findMany({
      where: { tenantId },
      include: {
        availabilities: true,
        assignedRequirements: {
          include: {
            class: true,
            course: true,
          },
        },
      },
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
      include: {
        availabilities: true,
        assignedRequirements: {
          include: {
            class: true,
            course: true,
          },
        },
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
      include: {
        availabilities: true,
        assignedRequirements: {
          include: {
            class: true,
            course: true,
          },
        },
      },
    });
  }

  async assignToClass(teacherId: string, classId: string, courseId: string, weeklyHours: number, tenantId: string) {
    return this.prisma.classCourseRequirement.upsert({
      where: {
        classId_courseId: { classId, courseId },
      },
      update: {
        assignedTeacherId: teacherId,
        weeklyHours: weeklyHours || 2,
      },
      create: {
        tenantId,
        classId,
        courseId,
        assignedTeacherId: teacherId,
        weeklyHours: weeklyHours || 2,
      },
      include: {
        class: true,
        course: true,
        assignedTeacher: true,
      },
    });
  }

  async updateAvailabilities(teacherId: string, availabilities: any[], tenantId: string) {
    // Remplacement atomique des disponibilites
    await this.prisma.teacherAvailability.deleteMany({
      where: { teacherId, tenantId },
    });

    if (!availabilities || availabilities.length === 0) return [];

    return this.prisma.teacherAvailability.createMany({
      data: availabilities.map((a) => ({
        tenantId,
        teacherId,
        dayOfWeek: Number(a.dayOfWeek),
        startTime: a.startTime,
        endTime: a.endTime,
        preference: a.preference || 'AVAILABLE',
      })),
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
