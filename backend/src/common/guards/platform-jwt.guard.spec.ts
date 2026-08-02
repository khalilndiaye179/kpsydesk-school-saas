import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PlatformJwtGuard } from './platform-jwt.guard';

const contextWith = (headers: Record<string, unknown>) => {
  const request: any = { headers };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
};

describe('PlatformJwtGuard', () => {
  let jwtService: { verifyAsync: jest.Mock };
  let guard: PlatformJwtGuard;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    guard = new PlatformJwtGuard(jwtService as any);
  });

  it('rejects a request without an Authorization header', async () => {
    const { context } = contextWith({});
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const { context } = contextWith({ authorization: 'Basic abc' });
    await expect(guard.canActivate(context)).rejects.toThrow(/manquant ou invalide/);
  });

  it('rejects an unverifiable token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));
    const { context } = contextWith({ authorization: 'Bearer abc' });
    await expect(guard.canActivate(context)).rejects.toThrow(/invalide ou expiré/);
  });

  it('rejects the restricted platform:enroll scope', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', scope: 'platform:enroll' });
    const { context } = contextWith({ authorization: 'Bearer abc' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts the platform scope and attaches the user to the request', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u1',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      scope: 'platform',
    });
    const { context, request } = contextWith({ authorization: 'Bearer abc' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'u1',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      scope: 'platform',
    });
  });
});
