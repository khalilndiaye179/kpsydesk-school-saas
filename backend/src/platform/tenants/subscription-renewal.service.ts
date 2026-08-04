import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { processSubscriptionRenewals, SubscriptionItem } from '../../jobs/subscription-renewal.job';

@Injectable()
export class SubscriptionRenewalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Exécution du Cron Job quotidien de renouvellement d'abonnements
   */
  async runDailyRenewalJob() {
    // 1. Requête Prisma EXACTE extraite du service NestJS qui remplit les tenants & leur pays
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      select: {
        id: true,
        plan: true,
        country: true, // Champ country de la table Tenant
      },
    });

    // Mappage explicite vers les SubscriptionItems avec t.country
    const subscriptions: SubscriptionItem[] = tenants.map((t) => ({
      id: `sub_${t.id}`,
      tenant_id: t.id,
      plan_id: t.plan,
      prix_verrouille: 45000,
      date_prochain_renouvellement: new Date().toISOString(),
      country: t.country, // Transmis directement
    }));

    const plans = [
      { id: 'STANDARD', nom: 'Standard', prix: 25000, periodicite: 'MENSUEL' },
      { id: 'PRO', nom: 'Professionnel', prix: 45000, periodicite: 'MENSUEL' },
      { id: 'PREMIUM', nom: 'Premium', prix: 75000, periodicite: 'MENSUEL' },
    ];

    return processSubscriptionRenewals(
      subscriptions,
      plans,
      async (id, updates) => {
        // Mise à jour en base Prisma
      },
      async (tenantId, message) => {
        // Notification NestJS
      }
    );
  }
}
