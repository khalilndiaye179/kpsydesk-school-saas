import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenantUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        title: true,
        role: true,
        status: true,
        contractType: true,
        baseSalary: true,
        hourlyRate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.pass || 'KPsySchool2026!', 12);

    return this.prisma.tenantUser.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        title: data.title,
        role: data.role || 'TEACHER',
        status: 'ACTIVE',
        contractType: data.contractType || 'CDI',
        baseSalary: data.baseSalary,
        hourlyRate: data.hourlyRate,
      },
    });
  }
}
