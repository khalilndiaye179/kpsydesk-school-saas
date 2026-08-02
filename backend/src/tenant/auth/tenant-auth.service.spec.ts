import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TenantAuthService } from './tenant-auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('TenantAuthService', () => {
  let prisma: any;
  let tx: any;
  let jwtService: { signAsync: jest.Mock };
  let service: TenantAuthService;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 4);
  });

  beforeEach(() => {
    tx = { tenantUser: { findFirst: jest.fn() } };
    prisma = { runWithTenantContext: jest.fn((cb: any) => cb(tx)) };
    jwtService = { signAsync: jest.fn().mockResolvedValue('tenant-token') };
    service = new TenantAuthService(prisma, jwtService as any);
  });

  it('looks the user up under the tenant context', async () => {
    tx.tenantUser.findFirst.mockResolvedValue(null);
    await expect(
      service.login('user@example.com', 'x', 'tenant-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.runWithTenantContext).toHaveBeenCalled();
    expect(tx.tenantUser.findFirst).toHaveBeenCalledWith({
      where: { email: 'user@example.com', tenantId: 'tenant-1' },
    });
  });

  it('rejects a wrong password', async () => {
    tx.tenantUser.findFirst.mockResolvedValue({ id: 'u1', passwordHash });
    await expect(
      service.login('user@example.com', 'wrong', 'tenant-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('issues a tenant-scoped JWT on success', async () => {
    tx.tenantUser.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      role: 'DIRECTOR',
      tenantId: 'tenant-1',
      passwordHash,
    });

    await expect(
      service.login('user@example.com', 'correct-password', 'tenant-1'),
    ).resolves.toEqual({
      access_token: 'tenant-token',
      user: { id: 'u1', email: 'user@example.com', role: 'DIRECTOR' },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'user@example.com',
      role: 'DIRECTOR',
      tenantId: 'tenant-1',
    });
  });
});

describe('JwtStrategy', () => {
  it('maps the JWT payload to the request user', async () => {
    await expect(
      new JwtStrategy().validate({
        sub: 'u1',
        email: 'user@example.com',
        role: 'DIRECTOR',
        tenantId: 'tenant-1',
      }),
    ).resolves.toEqual({
      userId: 'u1',
      email: 'user@example.com',
      role: 'DIRECTOR',
      tenantId: 'tenant-1',
    });
  });
});
