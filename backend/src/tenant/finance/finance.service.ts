import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string, schoolYear = '2025-2026') {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [totalExpected, totalPaidAggregate, monthPayments, overdueFees, feesByLabel] = await Promise.all([
      // Total attendu (tous les frais)
      this.prisma.schoolFee.aggregate({
        where: { tenantId, schoolYear },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Total encaissé (tous les paiements)
      this.prisma.payment.aggregate({
        where: { tenantId },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Paiements du mois
      this.prisma.payment.aggregate({
        where: { tenantId, paidAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Frais en retard (dueDate < aujourd'hui, aucun paiement enregistré)
      this.prisma.schoolFee.findMany({
        where: {
          tenantId,
          schoolYear,
          dueDate: { lt: today },
          payments: { none: {} },
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, class: { select: { name: true } } } },
        },
        orderBy: { dueDate: 'asc' },
      }),

      // Répartition par type de frais
      this.prisma.schoolFee.groupBy({
        by: ['label'],
        where: { tenantId, schoolYear },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalExp = totalExpected._sum.amount ?? 0;
    const totalPaid = totalPaidAggregate._sum.amount ?? 0;
    const balance = totalExp - totalPaid;
    const collectionRate = totalExp > 0 ? Math.round((totalPaid / totalExp) * 100) : 0;

    return {
      schoolYear,
      totalExpected: totalExp,
      totalPaid,
      balance,
      collectionRate,
      monthlyRevenue: monthPayments._sum.amount ?? 0,
      monthlyPaymentsCount: monthPayments._count.id,
      overdueCount: overdueFees.length,
      overdueAmount: overdueFees.reduce((acc, f) => acc + f.amount, 0),
      overdueFees: overdueFees.slice(0, 10).map((f) => ({
        feeId: f.id,
        label: f.label,
        amount: f.amount,
        dueDate: f.dueDate,
        studentId: f.student.id,
        studentName: `${f.student.firstName} ${f.student.lastName}`,
        className: f.student.class?.name ?? '',
      })),
      feesByLabel: feesByLabel.map((fl) => ({
        label: fl.label,
        total: fl._sum.amount ?? 0,
        count: fl._count.id,
      })),
    };
  }

  async getFees(tenantId: string, filters: { studentId?: string; classId?: string; schoolYear?: string }) {
    const schoolYear = filters.schoolYear ?? '2025-2026';
    return this.prisma.schoolFee.findMany({
      where: {
        tenantId,
        schoolYear,
        ...(filters.studentId && { studentId: filters.studentId }),
        ...(filters.classId && { student: { classId: filters.classId } }),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, class: { select: { name: true } } } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createFee(tenantId: string, dto: any) {
    return this.prisma.schoolFee.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        label: dto.label,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        schoolYear: dto.schoolYear ?? '2025-2026',
      },
    });
  }

  async getPayments(tenantId: string, feeId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId, feeId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async recordPayment(tenantId: string, dto: any, recordedBy?: string) {
    return this.prisma.payment.create({
      data: {
        tenantId,
        feeId: dto.feeId,
        amount: dto.amount,
        method: dto.method ?? 'CASH',
        reference: dto.reference ?? null,
        notes: dto.notes ?? null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        recordedBy: recordedBy ?? null,
      },
    });
  }

  async getRecentPayments(tenantId: string, limit = 20) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { paidAt: 'desc' },
      take: limit,
      include: {
        fee: {
          include: {
            student: { select: { firstName: true, lastName: true, class: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async getOverdueFees(tenantId: string) {
    const today = new Date();
    return this.prisma.schoolFee.findMany({
      where: {
        tenantId,
        dueDate: { lt: today },
        payments: { none: {} },
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, class: { select: { name: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
