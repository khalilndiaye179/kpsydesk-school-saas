import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PublicSignupController } from './signup/signup.controller';
import { PlatformAuthController } from './platform/auth/platform-auth.controller';
import { PlatformTenantsController } from './platform/tenants/platform-tenants.controller';
import { TenantAuthController } from './tenant/auth/tenant-auth.controller';
import { StudentController } from './tenant/student/student.controller';

describe('PublicSignupController', () => {
  const signupService = {
    requestVerification: jest.fn().mockResolvedValue({ signupId: 's1' }),
    verifyOtp: jest.fn().mockResolvedValue({ tenantId: 't1' }),
  };
  const controller = new PublicSignupController(signupService as any);

  it('rejects the SMS channel before reaching the service', async () => {
    await expect(
      controller.requestVerification({ verificationChannel: 'sms' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(signupService.requestVerification).not.toHaveBeenCalled();
  });

  it('delegates both steps to the service', async () => {
    const dto = { verificationChannel: 'email' } as any;
    await expect(controller.requestVerification(dto)).resolves.toEqual({ signupId: 's1' });
    expect(signupService.requestVerification).toHaveBeenCalledWith(dto);

    const verifyDto = { signupId: 's1', email: 'a@b.c', otpCode: '123456' };
    await expect(controller.verifyOtp(verifyDto)).resolves.toEqual({ tenantId: 't1' });
    expect(signupService.verifyOtp).toHaveBeenCalledWith(verifyDto);
  });
});

describe('PlatformAuthController', () => {
  const authService = {
    login: jest.fn().mockResolvedValue({ status: 'otp_required' }),
    verifyOtp: jest.fn().mockResolvedValue({ access_token: 'tok' }),
  };
  const controller = new PlatformAuthController(authService as any);

  it('maps the request bodies to the service arguments', async () => {
    await controller.login({ email: 'a@b.c', pass: 'pw' });
    expect(authService.login).toHaveBeenCalledWith('a@b.c', 'pw');

    await controller.verifyOtp({ challenge_id: 'c1', otp_code: '123456' });
    expect(authService.verifyOtp).toHaveBeenCalledWith('c1', '123456');
  });
});

describe('PlatformTenantsController', () => {
  const service = {
    findAll: jest.fn().mockResolvedValue([]),
    updateStatus: jest.fn().mockResolvedValue({}),
  };
  const controller = new PlatformTenantsController(service as any);
  const superAdmin = { user: { role: 'SUPER_ADMIN' } };

  it('forbids non super-admins', async () => {
    await expect(controller.findAll({ user: { role: 'SUPPORT' } })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      controller.updateStatus({ user: { role: 'SUPPORT' } }, 't1', 'ACTIVE'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an unknown status', async () => {
    await expect(
      controller.updateStatus(superAdmin, 't1', 'DELETED' as any),
    ).rejects.toThrow(/Statut invalide/);
  });

  it('delegates to the service for a super admin', async () => {
    await controller.findAll(superAdmin);
    await controller.updateStatus(superAdmin, 't1', 'SUSPENDED');
    expect(service.findAll).toHaveBeenCalled();
    expect(service.updateStatus).toHaveBeenCalledWith('t1', 'SUSPENDED');
  });
});

describe('TenantAuthController', () => {
  const authService = { login: jest.fn().mockResolvedValue({ access_token: 'tok' }) };
  const controller = new TenantAuthController(authService as any);

  it('requires the x-tenant-id header', async () => {
    await expect(
      controller.login({ email: 'a@b.c', pass: 'pw' }, undefined as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('forwards the tenant id to the service', async () => {
    await controller.login({ email: 'a@b.c', pass: 'pw' }, 'tenant-1');
    expect(authService.login).toHaveBeenCalledWith('a@b.c', 'pw', 'tenant-1');
  });
});

describe('StudentController', () => {
  const studentService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'st1' }),
    create: jest.fn().mockResolvedValue({ id: 'st1' }),
  };
  const controller = new StudentController(studentService as any);

  it('takes the tenant id from the authenticated request user', async () => {
    await controller.create({ firstName: 'Awa' }, { user: { tenantId: 'tenant-1' } } as any);
    expect(studentService.create).toHaveBeenCalledWith({ firstName: 'Awa' }, 'tenant-1');
  });

  it('delegates reads to the service', async () => {
    await controller.findAll();
    await controller.findOne('st1');
    expect(studentService.findAll).toHaveBeenCalled();
    expect(studentService.findOne).toHaveBeenCalledWith('st1');
  });
});
