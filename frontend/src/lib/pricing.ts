import { STORAGE_KEYS, readStored } from './storage';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  maxStudents?: number;
  [key: string]: any;
}

/**
 * Migration automatique des anciens tarifs (50k / 150k / 350k) vers la grille
 * actuelle (25k / 45k / 75k) et du quota d'élèves 500 -> 350.
 */
function migrateLegacyPlanPricing<T extends PricingPlan>(plans: T[]): T[] {
  return plans.map((plan) => ({
    ...plan,
    price: plan.price === 50000 ? 25000 : plan.price === 150000 ? 45000 : plan.price === 350000 ? 75000 : plan.price,
    maxStudents: plan.maxStudents === 500 ? 350 : plan.maxStudents,
  }));
}

/** Plans publiés par le super admin, migrés vers la grille tarifaire courante. */
export function readPricingPlans<T extends PricingPlan>(fallback: T[] = []): T[] {
  const stored = readStored<T[]>(STORAGE_KEYS.pricingPlans, fallback);
  return Array.isArray(stored) && stored.length > 0 ? migrateLegacyPlanPricing(stored) : fallback;
}
