jest.mock('@prisma/client', () => ({
  // Stub client: the generated engine is not available in unit tests.
  PrismaClient: class {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    $transaction = jest.fn();
  },
}));

import { PrismaService } from './prisma.service';
import { tenantLocalStorage } from './common/tenancy/tenant.middleware';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('runs the callback directly on the client when there is no tenant context', async () => {
    const callback = jest.fn().mockResolvedValue('result');

    await expect(service.runWithTenantContext(callback)).resolves.toBe('result');
    expect(callback).toHaveBeenCalledWith(service);
    expect(service.$transaction).not.toHaveBeenCalled();
  });

  it('opens a transaction and sets app.tenant_id when a tenant context exists', async () => {
    const tx = { $executeRawUnsafe: jest.fn().mockResolvedValue(0) };
    (service.$transaction as unknown as jest.Mock).mockImplementation((cb: any) => cb(tx));
    const callback = jest.fn().mockResolvedValue('scoped');

    const result = await tenantLocalStorage.run('tenant-1', () =>
      service.runWithTenantContext(callback),
    );

    expect(result).toBe('scoped');
    expect(tx.$executeRawUnsafe).toHaveBeenCalledWith("SET LOCAL app.tenant_id = 'tenant-1';");
    expect(callback).toHaveBeenCalledWith(tx);
  });

  it('connects and disconnects with the Nest lifecycle hooks', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(service.$connect).toHaveBeenCalled();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
