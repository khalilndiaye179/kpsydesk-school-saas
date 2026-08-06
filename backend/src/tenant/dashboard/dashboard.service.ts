import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Requêtes parallèles pour performance maximale
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalUsers,
      absencesToday,
      absencesThisMonth,
      totalFees,
      totalPaid,
      overdueFeesCount,
      recentPayments,
      recentAbsences,
      topAbsentStudents,
    ] = await Promise.all([
      // Comptages de base
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.teacher.count({ where: { tenantId } }),
      this.prisma.class.count({ where: { tenantId } }),
      this.prisma.tenantUser.count({ where: { tenantId } }),

      // Absences du jour
      this.prisma.attendance.count({
        where: {
          tenantId,
          date: { gte: today, lt: tomorrow },
          type: 'ABSENCE',
        },
      }),

      // Absences du mois
      this.prisma.attendance.count({
        where: {
          tenantId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),

      // Finance : total des frais déclarés
      this.prisma.schoolFee.aggregate({
        where: { tenantId },
        _sum: { amount: true },
      }),

      // Finance : total encaissé ce mois
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Frais en retard (dueDate dépassée sans paiement complet)
      this.prisma.schoolFee.count({
        where: {
          tenantId,
          dueDate: { lt: today },
          payments: { none: {} },
        },
      }),

      // 5 derniers paiements
      this.prisma.payment.findMany({
        where: { tenantId },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: {
          fee: {
            include: {
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),

      // Absences 30 derniers jours (pour graphique sparkline)
      this.prisma.attendance.groupBy({
        by: ['date'],
        where: {
          tenantId,
          date: { gte: thirtyDaysAgo },
          type: 'ABSENCE',
        },
        _count: { id: true },
        orderBy: { date: 'asc' },
      }),

      // Top 5 élèves les plus absents du mois
      this.prisma.attendance.groupBy({
        by: ['studentId'],
        where: {
          tenantId,
          date: { gte: startOfMonth },
          type: 'ABSENCE',
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Récupérer les noms des élèves les plus absents
    const topAbsentIds = topAbsentStudents.map((a) => a.studentId);
    const topAbsentDetails = topAbsentIds.length
      ? await this.prisma.student.findMany({
          where: { id: { in: topAbsentIds } },
          select: { id: true, firstName: true, lastName: true, class: { select: { name: true } } },
        })
      : [];

    const topAbsentWithNames = topAbsentStudents.map((a) => {
      const student = topAbsentDetails.find((s) => s.id === a.studentId);
      return {
        studentId: a.studentId,
        firstName: student?.firstName ?? 'Inconnu',
        lastName: student?.lastName ?? '',
        className: student?.class?.name ?? '',
        absenceCount: a._count.id,
      };
    });

    // Taux de présence du jour (0% si aucun élève)
    const totalStudentsToday = totalStudents;
    const presentToday = totalStudentsToday - absencesToday;
    const attendanceRate =
      totalStudentsToday > 0
        ? Math.round((presentToday / totalStudentsToday) * 100)
        : 0;

    // Comptages par genre réels
    const femaleStudents = await this.prisma.student.count({
      where: { tenantId, gender: { in: ['F', 'FEMININ', 'FEMALE', 'Féminin'] } },
    });
    const maleStudents = await this.prisma.student.count({
      where: { tenantId, gender: { in: ['M', 'MASCULIN', 'MALE', 'Masculin'] } },
    });

    // Revenus et impayés
    const totalExpected = totalFees._sum.amount ?? 0;
    const totalCollected = totalPaid._sum.amount ?? 0;
    const collectionRate =
      totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0;

    return {
      // KPIs principaux
      totalStudents,
      femaleStudents,
      maleStudents,
      totalTeachers,
      totalClasses,
      totalUsers,

      // Présences
      absencesToday,
      absencesThisMonth,
      attendanceRate,

      // Finance
      totalExpected,
      totalCollected,
      collectionRate,
      overdueFeesCount,

      // Historique absences (sparkline)
      absencesTrend: recentAbsences.map((a) => ({
        date: a.date,
        count: a._count.id,
      })),

      // Top absents
      topAbsentStudents: topAbsentWithNames,

      // Derniers paiements
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        paidAt: p.paidAt,
        studentName: p.fee.student
          ? `${p.fee.student.firstName} ${p.fee.student.lastName}`
          : 'Inconnu',
        feeLabel: p.fee.label,
      })),
    };
  }
}
