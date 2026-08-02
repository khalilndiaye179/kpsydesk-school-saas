import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PublicSignupService, RequestVerificationDto } from './signup.service';

const validDto = (overrides: Partial<RequestVerificationDto> = {}): RequestVerificationDto => ({
  schoolName: 'École Test',
  subdomain: 'Ecole  Test--',
  plan: 'STANDARD',
  billingCycle: 'MONTHLY',
  firstName: 'Awa',
  lastName: 'Diop',
  email: 'awa@example.com',
  phone: '+221771234567',
  country: 'SN',
  jobTitle: 'Directrice',
  password: 'password123',
  verificationChannel: 'email',
  ...overrides,
});

const createPrismaMock = () => ({
  tenant: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
  pendingSignup: {
    upsert: jest.fn().mockResolvedValue({ id: 'pending-1' }),
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  $transaction: jest.fn(),
});

describe('PublicSignupService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let mailService: { sendOtpCode: jest.Mock };
  let service: PublicSignupService;

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    prisma = createPrismaMock();
    mailService = { sendOtpCode: jest.fn().mockResolvedValue(true) };
    service = new PublicSignupService(prisma as any, mailService as any);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('requestVerification', () => {
    it('rejects the SMS channel', async () => {
      await expect(
        service.requestVerification(validDto({ verificationChannel: 'sms' })),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.pendingSignup.upsert).not.toHaveBeenCalled();
    });

    it('rejects an unknown plan', async () => {
      await expect(service.requestVerification(validDto({ plan: 'GOLD' }))).rejects.toThrow(
        /Plan invalide/,
      );
    });

    it('rejects an unknown billing cycle', async () => {
      await expect(
        service.requestVerification(validDto({ billingCycle: 'WEEKLY' })),
      ).rejects.toThrow(/Cycle de facturation invalide/);
    });

    it('rejects an invalid phone number', async () => {
      await expect(service.requestVerification(validDto({ phone: '12' }))).rejects.toThrow(
        /Numéro de téléphone invalide/,
      );
    });

    it('rejects a password shorter than 8 characters', async () => {
      await expect(service.requestVerification(validDto({ password: 'short' }))).rejects.toThrow(
        /au moins 8 caractères/,
      );
    });

    it('rejects a subdomain already taken by an existing tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      await expect(service.requestVerification(validDto())).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('slugifies the subdomain, normalizes the phone and hashes secrets', async () => {
      const result = await service.requestVerification(validDto());

      expect(result).toEqual({ signupId: 'pending-1' });
      const args = prisma.pendingSignup.upsert.mock.calls[0][0];
      expect(args.where).toEqual({ email: 'awa@example.com' });
      expect(args.create.subdomain).toBe('ecole-test');
      expect(args.create.phone).toBe('+221771234567');
      expect(args.create.verificationChannel).toBe('email');
      expect(args.create.passwordHash).not.toBe('password123');
      expect(args.create.expiresAt).toEqual(new Date('2026-01-01T00:15:00Z'));
      expect(args.update.attempts).toBe(0);

      const [, otp] = mailService.sendOtpCode.mock.calls[0];
      expect(otp).toMatch(/^\d{6}$/);
      await expect(bcrypt.compare(otp, args.create.otpCodeHash)).resolves.toBe(true);
    });

    it('deletes the pending signup when the OTP email cannot be sent', async () => {
      mailService.sendOtpCode.mockResolvedValue(false);

      await expect(service.requestVerification(validDto())).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      expect(prisma.pendingSignup.delete).toHaveBeenCalledWith({ where: { id: 'pending-1' } });
    });
  });

  describe('verifyOtp', () => {
    const otpCode = '123456';
    let pending: any;

    beforeEach(async () => {
      pending = {
        id: 'pending-1',
        email: 'awa@example.com',
        otpCodeHash: await bcrypt.hash(otpCode, 4),
        expiresAt: new Date('2026-01-01T00:10:00Z'),
        attempts: 0,
        plan: 'STANDARD',
        subdomain: 'ecole-test',
        schoolName: 'École Test',
        passwordHash: 'hashed',
        firstName: 'Awa',
        lastName: 'Diop',
        phone: '+221771234567',
        jobTitle: 'Directrice',
      };
      prisma.pendingSignup.findUnique.mockResolvedValue(pending);
    });

    const dto = { signupId: 'pending-1', email: 'awa@example.com', otpCode };

    it('throws when the pending signup does not exist', async () => {
      prisma.pendingSignup.findUnique.mockResolvedValue(null);
      await expect(service.verifyOtp(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when the email does not match the pending signup', async () => {
      await expect(service.verifyOtp({ ...dto, email: 'other@example.com' })).rejects.toThrow(
        /ne correspond pas/,
      );
    });

    it('deletes the pending signup and throws when the OTP expired', async () => {
      jest.setSystemTime(new Date('2026-01-01T00:20:00Z'));
      await expect(service.verifyOtp(dto)).rejects.toThrow(/expiré/);
      expect(prisma.pendingSignup.delete).toHaveBeenCalledWith({ where: { id: 'pending-1' } });
    });

    it('deletes the pending signup after 5 failed attempts', async () => {
      pending.attempts = 5;
      await expect(service.verifyOtp(dto)).rejects.toThrow(/Nombre maximum de tentatives/);
      expect(prisma.pendingSignup.delete).toHaveBeenCalledWith({ where: { id: 'pending-1' } });
    });

    it('increments attempts and reports the remaining ones on a wrong code', async () => {
      await expect(service.verifyOtp({ ...dto, otpCode: '000000' })).rejects.toThrow(
        /4 tentative\(s\) restante\(s\)/,
      );
      expect(prisma.pendingSignup.update).toHaveBeenCalledWith({
        where: { id: 'pending-1' },
        data: { attempts: 1 },
      });
    });

    it('throws when the stored plan is no longer valid', async () => {
      pending.plan = 'LEGACY';
      await expect(service.verifyOtp(dto)).rejects.toThrow(/n'est plus valide/);
    });

    it('throws when the subdomain got taken between the two steps', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      await expect(service.verifyOtp(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates the tenant, its director and its settings atomically', async () => {
      const tx = {
        tenant: {
          create: jest
            .fn()
            .mockResolvedValue({ id: 'tenant-1', name: 'École Test', subdomain: 'ecole-test' }),
        },
        tenantUser: { create: jest.fn().mockResolvedValue({}) },
        tenantSettings: { create: jest.fn().mockResolvedValue({}) },
      };
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));

      await expect(service.verifyOtp(dto)).resolves.toEqual({
        tenantId: 'tenant-1',
        tenantSubdomain: 'ecole-test',
        adminEmail: 'awa@example.com',
      });

      expect(tx.tenant.create).toHaveBeenCalledWith({
        data: {
          name: 'École Test',
          subdomain: 'ecole-test',
          plan: 'STANDARD',
          status: 'TRIAL',
        },
      });
      expect(tx.tenantUser.create.mock.calls[0][0].data).toMatchObject({
        tenantId: 'tenant-1',
        email: 'awa@example.com',
        role: 'DIRECTOR',
        status: 'ACTIVE',
      });
      expect(tx.tenantSettings.create).toHaveBeenCalledWith({ data: { tenantId: 'tenant-1' } });
      expect(prisma.pendingSignup.delete).toHaveBeenCalledWith({ where: { id: 'pending-1' } });
    });
  });

  describe('purgeExpiredSignups', () => {
    it('deletes every expired pending signup', async () => {
      prisma.pendingSignup.deleteMany.mockResolvedValue({ count: 3 });
      await service.purgeExpiredSignups();
      expect(prisma.pendingSignup.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: new Date('2026-01-01T00:00:00Z') } },
      });
    });

    it('swallows database errors', async () => {
      prisma.pendingSignup.deleteMany.mockRejectedValue(new Error('db down'));
      await expect(service.purgeExpiredSignups()).resolves.toBeUndefined();
    });
  });
});
