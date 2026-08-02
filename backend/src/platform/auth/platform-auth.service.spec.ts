import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { PlatformAuthService } from './platform-auth.service';

describe('PlatformAuthService', () => {
  let prisma: any;
  let jwtService: { signAsync: jest.Mock };
  let service: PlatformAuthService;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 4);
  });

  beforeEach(() => {
    prisma = {
      platformUser: { findUnique: jest.fn() },
      otpChallenge: {
        create: jest.fn().mockResolvedValue({ id: 'challenge-1' }),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
    service = new PlatformAuthService(prisma, jwtService as any);
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      prisma.platformUser.findUnique.mockResolvedValue(null);
      await expect(service.login('nobody@example.com', 'x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a wrong password', async () => {
      prisma.platformUser.findUnique.mockResolvedValue({ id: 'u1', passwordHash });
      await expect(service.login('admin@example.com', 'wrong')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns a restricted enrollment token when MFA is not enrolled', async () => {
      prisma.platformUser.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
        passwordHash,
        isMfaEnrolled: false,
        mustChangePassword: true,
      });

      await expect(service.login('admin@example.com', 'correct-password')).resolves.toEqual({
        status: 'mfa_enrollment_required',
        enroll_token: 'signed-token',
        mustChangePassword: true,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ scope: 'platform:enroll', sub: 'u1' }),
        { expiresIn: '15m' },
      );
      expect(prisma.otpChallenge.create).not.toHaveBeenCalled();
    });

    it('creates a hashed OTP challenge when MFA is enrolled', async () => {
      prisma.platformUser.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
        passwordHash,
        isMfaEnrolled: true,
        mustChangePassword: false,
      });

      await expect(service.login('admin@example.com', 'correct-password')).resolves.toEqual({
        status: 'otp_required',
        challenge_id: 'challenge-1',
        mustChangePassword: false,
      });
      const data = prisma.otpChallenge.create.mock.calls[0][0].data;
      expect(data.userId).toBe('u1');
      expect(data.codeHash).toEqual(expect.any(String));
      expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('verifyOtp', () => {
    const buildChallenge = async (overrides: any = {}) => ({
      id: 'challenge-1',
      email: 'admin@example.com',
      codeHash: await bcrypt.hash('654321', 4),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      usedAt: null,
      ...overrides,
    });

    const user = {
      id: 'u1',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      mustChangePassword: false,
      twoFactorSecret: null,
    };

    it('rejects a missing or already used challenge', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(null);
      await expect(service.verifyOtp('challenge-1', '654321')).rejects.toThrow(
        /invalide ou déjà utilisée/,
      );

      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge({ usedAt: new Date() }));
      await expect(service.verifyOtp('challenge-1', '654321')).rejects.toThrow(
        /invalide ou déjà utilisée/,
      );
    });

    it('rejects an expired challenge', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(
        await buildChallenge({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(service.verifyOtp('challenge-1', '654321')).rejects.toThrow(/expiré/);
    });

    it('rejects a challenge that reached the attempt limit', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge({ attempts: 5 }));
      await expect(service.verifyOtp('challenge-1', '654321')).rejects.toThrow(
        /Nombre maximum de tentatives/,
      );
    });

    it('rejects when the platform user no longer exists', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge());
      prisma.platformUser.findUnique.mockResolvedValue(null);
      await expect(service.verifyOtp('challenge-1', '654321')).rejects.toThrow(
        /Utilisateur introuvable/,
      );
    });

    it('increments attempts on an incorrect code', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge({ attempts: 2 }));
      prisma.platformUser.findUnique.mockResolvedValue(user);

      await expect(service.verifyOtp('challenge-1', '000000')).rejects.toThrow(/incorrect/);
      expect(prisma.otpChallenge.update).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        data: { attempts: 3 },
      });
    });

    it('accepts the emailed code, marks the challenge used and issues a platform JWT', async () => {
      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge());
      prisma.platformUser.findUnique.mockResolvedValue(user);

      await expect(service.verifyOtp('challenge-1', '654321')).resolves.toEqual({
        access_token: 'signed-token',
        user: {
          id: 'u1',
          email: 'admin@example.com',
          role: 'SUPER_ADMIN',
          mustChangePassword: false,
        },
      });
      expect(prisma.otpChallenge.update).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        data: { usedAt: expect.any(Date) },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ scope: 'platform' }),
        { expiresIn: '8h' },
      );
    });

    it('accepts a valid TOTP code when the user has a 2FA secret', async () => {
      const secret = speakeasy.generateSecret().base32;
      const token = speakeasy.totp({ secret, encoding: 'base32' });
      prisma.otpChallenge.findUnique.mockResolvedValue(await buildChallenge());
      prisma.platformUser.findUnique.mockResolvedValue({ ...user, twoFactorSecret: secret });

      await expect(service.verifyOtp('challenge-1', token)).resolves.toMatchObject({
        access_token: 'signed-token',
      });
    });
  });
});
