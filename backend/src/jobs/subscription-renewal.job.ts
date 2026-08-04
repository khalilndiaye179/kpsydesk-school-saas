/**
 * JOB DE RENOUVELLEMENT D'ABONNEMENT SAAS MULTI-TENANT
 * 
 * Ce script/Edge Function s'exécute périodiquement (Cron job quotidien / Supabase Edge Function).
 * Il identifie les souscriptions arrivées à échéance, applique le nouveau tarif live du plan,
 * met à jour le prix_verrouille pour le prochain cycle et notifie l'organisation.
 */

import { formatCurrency } from '../common/countries.config';

export interface SubscriptionRenewalResult {
  processedCount: number;
  updatedPricesCount: number;
  notificationsSent: number;
}

export async function processSubscriptionRenewals(
  subscriptions: any[],
  plans: any[],
  updateSubscription: (id: string, updates: any) => Promise<void>,
  sendNotification: (tenantId: string, message: string) => Promise<void>
): Promise<SubscriptionRenewalResult> {
  const now = new Date();
  let processedCount = 0;
  let updatedPricesCount = 0;
  let notificationsSent = 0;

  for (const sub of subscriptions) {
    const nextRenewal = new Date(sub.date_prochain_renouvellement);
    
    // Si la date de renouvellement est atteinte ou dépassée
    if (nextRenewal <= now) {
      processedCount++;
      const livePlan = plans.find(p => p.id === sub.plan_id);

      if (livePlan) {
        const oldLockedPrice = Number(sub.prix_verrouille);
        const newLivePrice = Number(livePlan.prix || livePlan.price);
        const priceChanged = oldLockedPrice !== newLivePrice;

        // Calcul de la nouvelle date de renouvellement (+ 1 mois par défaut ou selon périodicité)
        const nextCycleDate = new Date(nextRenewal);
        if (livePlan.periodicite === 'ANNUEL') {
          nextCycleDate.setFullYear(nextCycleDate.getFullYear() + 1);
        } else {
          nextCycleDate.setMonth(nextCycleDate.getMonth() + 1);
        }

        // Mise à jour de la souscription avec le nouveau prix verrouillé
        await updateSubscription(sub.id, {
          prix_verrouille: newLivePrice,
          date_debut_cycle: nextRenewal.toISOString(),
          date_prochain_renouvellement: nextCycleDate.toISOString(),
          updated_at: new Date().toISOString()
        });

        if (priceChanged) {
          updatedPricesCount++;
          await sendNotification(
            sub.tenant_id,
            `Votre abonnement au plan ${livePlan.nom || livePlan.name} a été renouvelé. Votre nouveau tarif contractuel est de ${formatCurrency(newLivePrice, sub.country || sub.tenant_country || sub.tenant?.country || 'SN')} / cycle.`
          );
          notificationsSent++;
        }
      }
    }
  }

  return { processedCount, updatedPricesCount, notificationsSent };
}
