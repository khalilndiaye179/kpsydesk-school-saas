import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PlatformTenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'DIRECTOR' },
          select: { email: true, firstName: true, lastName: true, phone: true },
          take: 1,
        },
        _count: {
          select: { students: true, users: true },
        },
      },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      plan: t.plan,
      status: t.status,
      createdAt: t.createdAt,
      studentsCount: t._count.students,
      usersCount: t._count.users,
      contactEmail: t.users[0]?.email ?? null,
      contactName: t.users[0]
        ? `${t.users[0].firstName ?? ''} ${t.users[0].lastName ?? ''}`.trim()
        : null,
      contactPhone: t.users[0]?.phone ?? null,
    }));
  }

  async updateStatus(tenantId: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }
}
