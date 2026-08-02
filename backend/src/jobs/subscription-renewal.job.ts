/**
 * JOB DE RENOUVELLEMENT D'ABONNEMENT SAAS MULTI-TENANT
 * 
 * Ce script/Edge Function s'exécute périodiquement (Cron job quotidien / Supabase Edge Function).
 * Il identifie les souscriptions arrivées à échéance, applique le nouveau tarif live du plan,
 * met à jour le prix_verrouille pour le prochain cycle et notifie l'organisation.
 */

export interface SubscriptionRenewalError {
  subscriptionId: string;
  reason: string;
}

export interface SubscriptionRenewalResult {
  processedCount: number;
  updatedPricesCount: number;
  notificationsSent: number;
  /** Souscriptions dues mais ignorées faute de plan live correspondant. */
  skippedCount: number;
  /** Échecs isolés par souscription : le job continue mais l'erreur est remontée. */
  errors: SubscriptionRenewalError[];
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
  let skippedCount = 0;
  const errors: SubscriptionRenewalError[] = [];

  for (const sub of subscriptions) {
    const nextRenewal = new Date(sub.date_prochain_renouvellement);

    // Si la date de renouvellement est atteinte ou dépassée
    if (nextRenewal > now) {
      continue;
    }

    processedCount++;
    const livePlan = plans.find(p => p.id === sub.plan_id);

    if (!livePlan) {
      // Ne pas ignorer silencieusement : on comptabilise et on trace la raison.
      skippedCount++;
      const reason = `Aucun plan live trouvé pour plan_id="${sub.plan_id}"`;
      console.warn(`[subscription-renewal] Souscription ${sub.id} ignorée : ${reason}`);
      errors.push({ subscriptionId: sub.id, reason });
      continue;
    }

    // Isolation par souscription : l'échec de l'une ne doit pas interrompre le lot entier.
    try {
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
          `Votre abonnement au plan ${livePlan.nom || livePlan.name} a été renouvelé. Votre nouveau tarif contractuel est de ${newLivePrice.toLocaleString('fr-FR')} FCFA / cycle.`
        );
        notificationsSent++;
      }
    } catch (err: any) {
      const reason = err?.message || String(err);
      console.error(`[subscription-renewal] Échec du traitement de la souscription ${sub.id} : ${reason}`);
      errors.push({ subscriptionId: sub.id, reason });
    }
  }

  return { processedCount, updatedPricesCount, notificationsSent, skippedCount, errors };
}
