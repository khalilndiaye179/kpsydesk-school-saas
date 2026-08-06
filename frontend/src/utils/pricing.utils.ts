export interface TierCalculation {
  basePrice: number;
  baseQuota: number;
  maxQuota: number;
  tierSize: number;
  tierPrice: number;
  requestedQuota: number;
  extraTiers: number;
  extraQuota: number;
  extraCost: number;
  totalPrice: number;
}

export function calculateTierPricing(requestedQuota: number): TierCalculation {
  const basePrice = 25000;
  const baseQuota = 500;
  const maxQuota = 5000;
  const tierSize = 50;
  const tierPrice = 5000;

  // Clamper la valeur entre 500 et 5000
  const clampedQuota = Math.max(baseQuota, Math.min(requestedQuota || 500, maxQuota));

  const extraQuotaNeeded = Math.max(0, clampedQuota - baseQuota);
  const extraTiers = Math.ceil(extraQuotaNeeded / tierSize);
  const extraCost = extraTiers * tierPrice;
  const totalPrice = basePrice + extraCost;

  return {
    basePrice,
    baseQuota,
    maxQuota,
    tierSize,
    tierPrice,
    requestedQuota: clampedQuota,
    extraTiers,
    extraQuota: extraTiers * tierSize,
    extraCost,
    totalPrice,
  };
}
