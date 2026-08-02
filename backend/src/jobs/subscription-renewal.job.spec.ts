import { processSubscriptionRenewals } from './subscription-renewal.job';

describe('processSubscriptionRenewals', () => {
  let updateSubscription: jest.Mock;
  let sendNotification: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-15T00:00:00Z'));
    updateSubscription = jest.fn().mockResolvedValue(undefined);
    sendNotification = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => jest.useRealTimers());

  const run = (subs: any[], plans: any[]) =>
    processSubscriptionRenewals(subs, plans, updateSubscription, sendNotification);

  it('ignores subscriptions whose renewal date is in the future', async () => {
    const result = await run(
      [{ id: 's1', plan_id: 'p1', prix_verrouille: 1000, date_prochain_renouvellement: '2026-07-01' }],
      [{ id: 'p1', prix: 1000 }],
    );

    expect(result).toEqual({ processedCount: 0, updatedPricesCount: 0, notificationsSent: 0 });
    expect(updateSubscription).not.toHaveBeenCalled();
  });

  it('renews a due subscription monthly without notifying when the price is unchanged', async () => {
    const result = await run(
      [{ id: 's1', plan_id: 'p1', prix_verrouille: 1000, date_prochain_renouvellement: '2026-06-01T00:00:00Z' }],
      [{ id: 'p1', prix: 1000, periodicite: 'MENSUEL', nom: 'Standard' }],
    );

    expect(result).toEqual({ processedCount: 1, updatedPricesCount: 0, notificationsSent: 0 });
    expect(updateSubscription).toHaveBeenCalledWith('s1', {
      prix_verrouille: 1000,
      date_debut_cycle: '2026-06-01T00:00:00.000Z',
      date_prochain_renouvellement: '2026-07-01T00:00:00.000Z',
      updated_at: '2026-06-15T00:00:00.000Z',
    });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('locks the new live price and notifies the tenant when it changed', async () => {
    const result = await run(
      [
        {
          id: 's1',
          tenant_id: 't1',
          plan_id: 'p1',
          prix_verrouille: 1000,
          date_prochain_renouvellement: '2026-06-01T00:00:00Z',
        },
      ],
      [{ id: 'p1', price: 2500, name: 'Premium' }],
    );

    expect(result).toEqual({ processedCount: 1, updatedPricesCount: 1, notificationsSent: 1 });
    expect(updateSubscription.mock.calls[0][1].prix_verrouille).toBe(2500);
    expect(sendNotification).toHaveBeenCalledWith('t1', expect.stringContaining('Premium'));
  });

  it('advances the cycle by a year for annual plans', async () => {
    await run(
      [{ id: 's1', plan_id: 'p1', prix_verrouille: 10, date_prochain_renouvellement: '2026-06-01T00:00:00Z' }],
      [{ id: 'p1', prix: 10, periodicite: 'ANNUEL' }],
    );

    expect(updateSubscription.mock.calls[0][1].date_prochain_renouvellement).toBe(
      '2027-06-01T00:00:00.000Z',
    );
  });

  it('counts a due subscription but skips it when its plan no longer exists', async () => {
    const result = await run(
      [{ id: 's1', plan_id: 'ghost', prix_verrouille: 10, date_prochain_renouvellement: '2026-01-01' }],
      [{ id: 'p1', prix: 10 }],
    );

    expect(result).toEqual({ processedCount: 1, updatedPricesCount: 0, notificationsSent: 0 });
    expect(updateSubscription).not.toHaveBeenCalled();
  });
});
