import { Test, TestingModule } from '@nestjs/testing';
import { PublicSignupService } from '../src/signup/signup.service';
import { PrismaService } from '../src/prisma.service';
import { MailService } from '../src/mail/mail.service';
import { ConflictException } from '@nestjs/common';

describe('PublicSignupService - Unicité Globale Email (Option A)', () => {
  let service: PublicSignupService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicSignupService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { findUnique: jest.fn().mockResolvedValue(null) },
            tenantUser: { findFirst: jest.fn() },
            platformUser: { findUnique: jest.fn().mockResolvedValue(null) },
          },
        },
        {
          provide: MailService,
          useValue: { sendOtpCode: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<PublicSignupService>(PublicSignupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('devrait rejeter la demande d\'inscription si l\'email existe déjà dans TenantUser', async () => {
    (prisma.tenantUser.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'directeur@ecole-existante.sn',
    });

    const dto = {
      schoolName: 'Nouvelle École',
      subdomain: 'nouvelle-ecole',
      plan: 'STANDARD',
      billingCycle: 'MONTHLY',
      firstName: 'Ibrahima',
      lastName: 'NDIAYE',
      email: 'directeur@ecole-existante.sn',
      phone: '+221770291160',
      country: 'SN',
      jobTitle: 'Fondateur',
      password: 'password123',
      verificationChannel: 'email',
    };

    await expect(service.requestVerification(dto as any)).rejects.toThrow(ConflictException);
    await expect(service.requestVerification(dto as any)).rejects.toThrow(
      "Cette adresse email est déjà associée à un compte utilisateur sur la plateforme KPSySchool. Veuillez utiliser une autre adresse email.",
    );
  });
});
