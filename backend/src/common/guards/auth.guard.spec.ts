import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

const contextWith = (headers: Record<string, unknown>) => {
  const request: any = { headers };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
};

describe('AuthGuard', () => {
  const guard = new AuthGuard();

  it('rejects a missing Authorization header', () => {
    const { context } = contextWith({});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects an unknown token', () => {
    const { context } = contextWith({ authorization: 'Bearer nope' });
    expect(() => guard.canActivate(context)).toThrow(/Token invalide/);
  });

  it('attaches a super admin user without tenant', () => {
    const { context, request } = contextWith({ authorization: 'Bearer fake-jwt-token-superadmin' });
    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-id', role: 'SUPER_ADMIN', tenantId: null });
  });

  it('attaches a tenant admin scoped to the x-tenant-id header', () => {
    const { context, request } = contextWith({
      authorization: 'Bearer fake-jwt-token-tenant',
      'x-tenant-id': 'tenant-1',
    });
    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-id', role: 'TENANT_ADMIN', tenantId: 'tenant-1' });
  });
});
