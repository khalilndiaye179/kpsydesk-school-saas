import { TenantMiddleware, tenantLocalStorage } from './tenant.middleware';

describe('TenantMiddleware', () => {
  const middleware = new TenantMiddleware();

  it('propagates the x-tenant-id header through the async local storage', () => {
    const next = jest.fn(() => {
      expect(tenantLocalStorage.getStore()).toBe('tenant-1');
    });

    middleware.use({ headers: { 'x-tenant-id': 'tenant-1' } } as any, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(tenantLocalStorage.getStore()).toBeUndefined();
  });

  it('calls next without a tenant context when the header is absent', () => {
    const next = jest.fn(() => {
      expect(tenantLocalStorage.getStore()).toBeUndefined();
    });

    middleware.use({ headers: {} } as any, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
