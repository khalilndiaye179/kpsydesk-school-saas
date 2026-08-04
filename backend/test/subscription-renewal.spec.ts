import { processSubscriptionRenewals } from '../src/jobs/subscription-renewal.job';

describe('Subscription Renewal Job - Multi-Country Context Test', () => {
  it('should format notification price with the exact tenant country (CI - Côte d\'Ivoire)', async () => {
    const mockSubscriptions = [
      {
        id: 'sub-ci-101',
        tenant_id: 'tenant-ci-001',
        plan_id: 'PRO',
        prix_verrouille: 35000,
        date_prochain_renouvellement: '2026-08-01T00:00:00.000Z', // Échéance dépassée
        tenant: {
          country: 'CI',
        },
      },
    ];

    const mockPlans = [
      {
        id: 'PRO',
        nom: 'Professionnel CI',
        prix: 45000, // Le tarif public a augmenté de 35000 à 45000
        periodicite: 'MENSUEL',
      },
    ];

    let updatedSub: any = null;
    let sentNotificationMsg = '';
    let sentTenantId = '';

    const updateSubscription = async (id: string, updates: any) => {
      updatedSub = updates;
    };

    const sendNotification = async (tenantId: string, message: string) => {
      sentTenantId = tenantId;
      sentNotificationMsg = message;
    };

    const result = await processSubscriptionRenewals(
      mockSubscriptions,
      mockPlans,
      updateSubscription,
      sendNotification
    );

    expect(result.processedCount).toBe(1);
    expect(result.updatedPricesCount).toBe(1);
    expect(result.notificationsSent).toBe(1);
    expect(sentTenantId).toBe('tenant-ci-001');
    expect(updatedSub.prix_verrouille).toBe(45000);
    // Vérification stricte que la notification contient 45 000 FCFA pour le tenant CI
    expect(sentNotificationMsg).toContain('45 000 FCFA');
  });
});
