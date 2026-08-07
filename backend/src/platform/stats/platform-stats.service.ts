import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PlatformStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retourne les statistiques globales de la plateforme SaaS en temps réel.
   * Appelé par le SuperAdmin Dashboard avec polling toutes les 30s.
   */
  async getGlobalStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const nonDemoFilter = { plan: { notIn: ['DEMO', 'TEST'] } };

    const demoFilter = { plan: { in: ['DEMO', 'TEST'] } };

    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalStudents,
      totalTeachers,
      totalUsers,
      newTenantsThisMonth,
      tenantsByPlan,
      tenantsByCountry,
      tenantsTrend,
      demoTenantsCount,
      demoStudentsCount,
    ] = await Promise.all([
      this.prisma.tenant.count({ where: nonDemoFilter }),
      this.prisma.tenant.count({ where: { ...nonDemoFilter, status: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { ...nonDemoFilter, status: 'TRIAL' } }),
      this.prisma.tenant.count({ where: { ...nonDemoFilter, status: 'SUSPENDED' } }),
      this.prisma.student.count({ where: { tenant: nonDemoFilter } }),
      this.prisma.teacher.count({ where: { tenant: nonDemoFilter } }),
      this.prisma.tenantUser.count({ where: { tenant: nonDemoFilter } }),
      this.prisma.tenant.count({ where: { ...nonDemoFilter, createdAt: { gte: startOfMonth, lte: endOfMonth } } }),

      // Répartition par plan SaaS
      this.prisma.tenant.groupBy({
        by: ['plan'],
        where: nonDemoFilter,
        _count: { id: true },
      }),

      // Répartition par pays
      this.prisma.tenant.groupBy({
        by: ['country'],
        where: nonDemoFilter,
        _count: { id: true },
      }),

      // Nouveaux tenants sur 30 jours (pour sparkline)
      this.prisma.tenant.findMany({
        where: { ...nonDemoFilter, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, status: true, plan: true, country: true },
        orderBy: { createdAt: 'asc' },
      }),

      // Comptage spécifique des établissements de Démo / Test
      this.prisma.tenant.count({ where: demoFilter }),
      this.prisma.student.count({ where: { tenant: demoFilter } }),
    ]);

    // Calcul du MRR estimé (basé sur les plans actifs)
    const planPricing: Record<string, number> = {
      TRIAL_7D: 0,
      STANDARD: 15000,
      PREMIUM: 30000,
      PRO: 50000,
      ENTERPRISE: 100000,
    };

    const mrrEstimate = tenantsByPlan.reduce((acc, p) => {
      return acc + (planPricing[p.plan] ?? 0) * p._count.id;
    }, 0);

    // Enrichir les stats par pays
    const countryNames: Record<string, string> = {
      SN: 'Sénégal', CI: "Côte d'Ivoire", ML: 'Mali', GN: 'Guinée', BF: 'Burkina Faso',
      TG: 'Togo', BJ: 'Bénin', NE: 'Niger', CM: 'Cameroun', MR: 'Mauritanie',
    };
    const countryFlags: Record<string, string> = {
      SN: '🇸🇳', CI: '🇨🇮', ML: '🇲🇱', GN: '🇬🇳', BF: '🇧🇫',
      TG: '🇹🇬', BJ: '🇧🇯', NE: '🇳🇪', CM: '🇨🇲', MR: '🇲🇷',
    };
    const countryColors: Record<string, string> = {
      SN: '#10b981', CI: '#f59e0b', ML: '#38bdf8', GN: '#f43f5e', BF: '#a855f7',
      TG: '#22d3ee', BJ: '#fb923c', NE: '#84cc16', CM: '#f87171', MR: '#818cf8',
    };

    const countryStats = tenantsByCountry.map((c) => ({
      code: c.country,
      name: countryNames[c.country] ?? c.country,
      flag: countryFlags[c.country] ?? '🌍',
      color: countryColors[c.country] ?? '#94a3b8',
      count: c._count.id,
      perc: totalTenants > 0 ? Math.round((c._count.id / totalTenants) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      // KPIs principaux
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalStudents,
      totalTeachers,
      totalUsers,
      newTenantsThisMonth,
      mrrEstimate,

      // Établissements de Démo / Test à l'écart
      demoTenantsCount,
      demoStudentsCount,

      // Répartition par plan
      tenantsByPlan: tenantsByPlan.map((p) => ({
        plan: p.plan,
        count: p._count.id,
        monthlyRevenue: (planPricing[p.plan] ?? 0) * p._count.id,
      })),

      // Répartition par pays
      countryStats,

      // Tendance 30 jours
      newTenantsTrend: tenantsTrend.map((t) => ({
        date: t.createdAt,
        country: t.country,
        plan: t.plan,
        status: t.status,
      })),

      // Timestamp de la mise à jour
      updatedAt: new Date().toISOString(),
    };
  }
}
