import { useState, useEffect } from 'react';

export interface TenantSubscriptionInfo {
  id: string;
  tenantId: string;
  planId: string;
  prixVerrouille: number;
  dateDebutCycle: string;
  dateProchainRenouvellement: string;
  statut: 'ACTIF' | 'EN_RETARD' | 'ANNULE';
}

export interface UseSubscriptionPricingResult {
  currentPlanId: string;
  currentLockedPrice: number;
  livePlanPrice: number;
  nextRenewalDate: string;
  isPriceChanged: boolean;
  livePlanName: string;
  triggerManualRenewal: () => void;
}

export const useSubscriptionPricing = (tenantId: string = 'samba_diouf'): UseSubscriptionPricingResult => {
  const STORAGE_SUB_KEY = `kpsydesk_tenant_sub_${tenantId}`;
  const STORAGE_PLANS_KEY = 'kpsydesk_pricing_plans';

  // 1. Charger les plans publiés live
  const [livePlans, setLivePlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchLivePlans = () => {
      const savedPlans = localStorage.getItem(STORAGE_PLANS_KEY);
      if (savedPlans) {
        try {
          setLivePlans(JSON.parse(savedPlans));
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchLivePlans();
    const interval = setInterval(fetchLivePlans, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Charger ou initialiser la souscription avec prix verrouillé
  const [subscription, setSubscription] = useState<TenantSubscriptionInfo>(() => {
    const savedSub = localStorage.getItem(STORAGE_SUB_KEY);
    if (savedSub) {
      try {
        const parsed = JSON.parse(savedSub);
        // Garantir que prixVerrouille n'est jamais NULL ou 0
        if (parsed && parsed.prixVerrouille && parsed.prixVerrouille > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Déterminer le tarif live initial pour le nouveau tenant (Fallback dynamique)
    const initialPlanId = 'PRO';
    const initialPrice = 45000;

    const defaultSub: TenantSubscriptionInfo = {
      id: `sub_${tenantId}`,
      tenantId,
      planId: initialPlanId,
      prixVerrouille: initialPrice, // COPIE DU PRIX LIVE DU PLAN AU MOMENT DE L'ONBOARDING
      dateDebutCycle: new Date().toISOString(),
      dateProchainRenouvellement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      statut: 'ACTIF'
    };

    localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(defaultSub));
    return defaultSub;
  });

  // Sauvegarder toute modification de souscription
  useEffect(() => {
    localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(subscription));
  }, [subscription, STORAGE_SUB_KEY]);

  // Trouver le plan live correspondant
  const currentLivePlan = livePlans.find(p => p.id === subscription.planId) || {
    id: subscription.planId,
    name: subscription.planId === 'BASIC' ? 'Starter (Basic)' : (subscription.planId === 'PRO' ? 'Professionnel' : 'Premium / Enterprise'),
    price: subscription.planId === 'BASIC' ? 25000 : (subscription.planId === 'PRO' ? 45000 : 75000)
  };

  const currentLockedPrice = subscription.prixVerrouille;
  const livePlanPrice = Number(currentLivePlan.price || currentLivePlan.prix);
  const isPriceChanged = livePlanPrice !== currentLockedPrice;

  // Déclenchement manuel du renouvellement
  const triggerManualRenewal = () => {
    const updatedSub: TenantSubscriptionInfo = {
      ...subscription,
      prixVerrouille: livePlanPrice, // Le prix verrouillé s'aligne sur le tarif live au moment du renouvellement
      dateDebutCycle: new Date().toISOString(),
      dateProchainRenouvellement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    setSubscription(updatedSub);
  };

  return {
    currentPlanId: subscription.planId,
    currentLockedPrice,
    livePlanPrice,
    nextRenewalDate: subscription.dateProchainRenouvellement,
    isPriceChanged,
    livePlanName: currentLivePlan.name || currentLivePlan.nom,
    triggerManualRenewal
  };
};
