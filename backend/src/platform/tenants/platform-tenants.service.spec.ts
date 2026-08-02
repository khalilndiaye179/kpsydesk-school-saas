import { PlatformTenantsService } from './platform-tenants.service';

describe('PlatformTenantsService', () => {
  let prisma: any;
  let service: PlatformTenantsService;

  beforeEach(() => {
    prisma = { tenant: { findMany: jest.fn(), update: jest.fn().mockResolvedValue({}) } };
    service = new PlatformTenantsService(prisma);
  });

  it('flattens the director contact and the counts', async () => {
    prisma.tenant.findMany.mockResolvedValue([
      {
        id: 't1',
        name: 'École Test',
        subdomain: 'ecole-test',
        plan: 'STANDARD',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        users: [
          { email: 'dir@example.com', firstName: 'Awa', lastName: 'Diop', phone: '+221771234567' },
        ],
        _count: { students: 42, users: 7 },
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 't1',
        name: 'École Test',
        subdomain: 'ecole-test',
        plan: 'STANDARD',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        studentsCount: 42,
        usersCount: 7,
        contactEmail: 'dir@example.com',
        contactName: 'Awa Diop',
        contactPhone: '+221771234567',
      },
    ]);
    expect(prisma.tenant.findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('returns null contact fields when the tenant has no director', async () => {
    prisma.tenant.findMany.mockResolvedValue([
      {
        id: 't1',
        name: 'École Test',
        subdomain: 'ecole-test',
        plan: 'TRIAL_7D',
        status: 'TRIAL',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        users: [],
        _count: { students: 0, users: 0 },
      },
    ]);

    const [tenant] = await service.findAll();
    expect(tenant).toMatchObject({ contactEmail: null, contactName: null, contactPhone: null });
  });

  it('trims a partially filled director name', async () => {
    prisma.tenant.findMany.mockResolvedValue([
      {
        id: 't1',
        name: 'École Test',
        subdomain: 'ecole-test',
        plan: 'STANDARD',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        users: [{ email: 'dir@example.com', firstName: 'Awa', lastName: null, phone: null }],
        _count: { students: 0, users: 1 },
      },
    ]);

    const [tenant] = await service.findAll();
    expect(tenant.contactName).toBe('Awa');
  });

  it('updates a tenant status', async () => {
    await service.updateStatus('t1', 'SUSPENDED');
    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'SUSPENDED' },
    });
  });
});
