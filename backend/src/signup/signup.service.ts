import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { getCountryDefaultSettings } from '../config/country-defaults';
import * as bcrypt from 'bcryptjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const BCRYPT_ROUNDS = 12;
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MINUTES = 15;
const VALID_PLANS = ['TRIAL_7D', 'STANDARD', 'PREMIUM', 'PRO', 'ENTERPRISE'];
const VALID_BILLING_CYCLES = ['MONTHLY', 'ANNUAL'];

export interface RequestVerificationDto {
  schoolName: string;
  subdomain: string;
  plan: string;
  billingCycle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  jobTitle: string;
  password: string;
  verificationChannel: string;
}

export interface VerifyOtpDto {
  signupId: string;
  email: string;
  otpCode: string;
}

@Injectable()
export class PublicSignupService {
  private readonly logger = new Logger(PublicSignupService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {
    // Purge périodique toutes les 10 minutes des PendingSignup expirés
    setInterval(() => this.purgeExpiredSignups(), 10 * 60 * 1000);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ÉTAPE 1 : Demande de vérification — envoi OTP
  // ────────────────────────────────────────────────────────────────────────────
  async requestVerification(dto: RequestVerificationDto): Promise<{ signupId: string }> {
    // 1. Rejet explicite du canal SMS (non opérationnel)
    if (dto.verificationChannel === 'sms') {
      throw new BadRequestException(
        "Le canal SMS n'est pas encore disponible. Veuillez sélectionner le canal Email.",
      );
    }

    // 2. Validation du plan
    if (!VALID_PLANS.includes(dto.plan)) {
      throw new BadRequestException(`Plan invalide : ${dto.plan}. Plans disponibles : ${VALID_PLANS.join(', ')}`);
    }

    // 3. Validation du cycle de facturation
    if (!VALID_BILLING_CYCLES.includes(dto.billingCycle)) {
      throw new BadRequestException(`Cycle de facturation invalide : ${dto.billingCycle}`);
    }

    // 4. Validation du numéro de téléphone (libphonenumber-js)
    const parsed = parsePhoneNumberFromString(dto.phone, dto.country as any);
    if (!parsed || !parsed.isValid()) {
      throw new BadRequestException(
        `Numéro de téléphone invalide pour le pays ${dto.country}. Format attendu : E.164 (ex: +221771234567)`,
      );
    }
    const normalizedPhone = parsed.format('E.164');

    // 5. Validation minimale du mot de passe
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
    }

    // 6. Vérification que le subdomain n'est pas déjà pris par un Tenant actif
    const subdomainSlug = dto.subdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: subdomainSlug },
    });
    if (existingTenant) {
      throw new ConflictException(
        `Le sous-domaine "${subdomainSlug}" est déjà utilisé par un autre établissement.`,
      );
    }

    // 6b. Vérification que l'email n'est pas déjà enregistré sur un autre établissement (TenantUser) ou compte Platform
    const [existingTenantUser, existingPlatformUser] = await Promise.all([
      this.prisma.tenantUser.findFirst({
        where: { email: { equals: dto.email, mode: 'insensitive' } },
      }),
      this.prisma.platformUser.findUnique({
        where: { email: dto.email.toLowerCase() },
      }),
    ]);

    if (existingTenantUser || existingPlatformUser) {
      throw new ConflictException(
        "Cette adresse email est déjà associée à un compte utilisateur sur la plateforme KPSySchool. Veuillez utiliser une autre adresse email.",
      );
    }

    // 7. Génération de l'OTP (6 chiffres)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 8. Hachage du mot de passe et de l'OTP (bcrypt cost=12)
    const [passwordHash, otpCodeHash] = await Promise.all([
      bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      bcrypt.hash(otp, BCRYPT_ROUNDS),
    ]);

    // 9. Expiration dans 15 minutes
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // 10. Upsert PendingSignup (gère les nouvelles tentatives pour le même email)
    const pending = await this.prisma.pendingSignup.upsert({
      where: { email: dto.email },
      update: {
        schoolName: dto.schoolName,
        subdomain: subdomainSlug,
        plan: dto.plan as any,
        billingCycle: dto.billingCycle,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: normalizedPhone,
        country: dto.country,
        jobTitle: dto.jobTitle,
        passwordHash,
        verificationChannel: 'email',
        otpCodeHash,
        expiresAt,
        attempts: 0,
      },
      create: {
        schoolName: dto.schoolName,
        subdomain: subdomainSlug,
        plan: dto.plan as any,
        billingCycle: dto.billingCycle,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: normalizedPhone,
        country: dto.country,
        jobTitle: dto.jobTitle,
        passwordHash,
        verificationChannel: 'email',
        otpCodeHash,
        expiresAt,
      },
    });

    // 11. Envoi de l'email OTP
    const emailSent = await this.mailService.sendOtpCode(
      dto.email,
      otp,
      dto.schoolName,
    );

    if (!emailSent) {
      // En cas d'échec d'envoi on supprime le PendingSignup créé pour ne pas laisser d'entrée orpheline
      await this.prisma.pendingSignup.delete({ where: { id: pending.id } });
      throw new UnprocessableEntityException(
        "L'envoi de l'email de vérification a échoué. Vérifiez votre adresse email et réessayez.",
      );
    }

    this.logger.log(`📧 OTP envoyé pour ${dto.email} (signupId: ${pending.id})`);
    return { signupId: pending.id };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ÉTAPE 2 : Vérification OTP + Création du Tenant
  // ────────────────────────────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto): Promise<{ tenantId: string; tenantSubdomain: string; adminEmail: string }> {
    // 1. Charger le PendingSignup
    const pending = await this.prisma.pendingSignup.findUnique({
      where: { id: dto.signupId },
    });

    if (!pending) {
      throw new NotFoundException("Demande d'inscription introuvable. Veuillez recommencer le processus.");
    }

    // 2. Vérifier que l'email correspond
    if (pending.email !== dto.email) {
      throw new BadRequestException("L'adresse email ne correspond pas à cette demande d'inscription.");
    }

    // 3. Vérifier l'expiration
    if (new Date() > pending.expiresAt) {
      await this.prisma.pendingSignup.delete({ where: { id: pending.id } });
      throw new BadRequestException(
        'Votre code de vérification a expiré. Veuillez recommencer le processus d\'inscription.',
      );
    }

    // 4. Vérifier le nombre de tentatives (max 5)
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      await this.prisma.pendingSignup.delete({ where: { id: pending.id } });
      throw new BadRequestException(
        'Nombre maximum de tentatives atteint (5/5). Votre demande a été annulée. Veuillez recommencer.',
      );
    }

    // 5. Vérifier le code OTP
    const isOtpValid = await bcrypt.compare(dto.otpCode, pending.otpCodeHash);
    if (!isOtpValid) {
      // Incrémenter le compteur d'échecs
      await this.prisma.pendingSignup.update({
        where: { id: pending.id },
        data: { attempts: pending.attempts + 1 },
      });
      const remaining = OTP_MAX_ATTEMPTS - pending.attempts - 1;
      throw new BadRequestException(
        `Code de vérification incorrect. ${remaining} tentative(s) restante(s).`,
      );
    }

    // 6. Revalider que le plan est toujours valide
    if (!VALID_PLANS.includes(pending.plan)) {
      throw new BadRequestException(`Le plan "${pending.plan}" n'est plus valide. Veuillez recommencer.`);
    }

    // 7. Vérifier que le subdomain n'a pas été pris entre les deux étapes
    const subdomainConflict = await this.prisma.tenant.findUnique({
      where: { subdomain: pending.subdomain },
    });
    if (subdomainConflict) {
      throw new ConflictException(
        `Le sous-domaine "${pending.subdomain}" vient d'être pris par un autre établissement. Veuillez recommencer avec un sous-domaine différent.`,
      );
    }

    // 8. Création atomique : Tenant + TenantUser (admin DIRECTOR) + TenantSettings
    const result = await this.prisma.$transaction(async (tx) => {
      const { generateTenantCodeSlug } = require('../common/utils/tenant-code.util');
      let baseCode = generateTenantCodeSlug(pending.schoolName);
      let code = baseCode;
      let codeIndex = 1;

      while (await tx.tenant.findUnique({ where: { code } })) {
        code = `${baseCode}${codeIndex}`;
        codeIndex++;
      }

      const initialUsername = `${code}-0001`;

      // Créer le Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: pending.schoolName,
          code,
          subdomain: pending.subdomain,
          plan: pending.plan,
          country: pending.country || 'SN',
          status: 'TRIAL',
        },
      });

      // Créer le TenantUser admin (DIRECTOR)
      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          username: initialUsername,
          email: pending.email,
          passwordHash: pending.passwordHash,
          firstName: pending.firstName,
          lastName: pending.lastName,
          phone: pending.phone,
          title: pending.jobTitle,
          role: 'DIRECTOR',
          status: 'ACTIVE',
        },
      });

      // Créer les TenantSettings par défaut adaptés au pays du tenant
      const countryDefaults = getCountryDefaultSettings(pending.country);
      await tx.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          ministry: countryDefaults.ministry,
          ia: countryDefaults.ia,
        },
      });

      return tenant;
    });

    // 9. Supprimer le PendingSignup
    await this.prisma.pendingSignup.delete({ where: { id: pending.id } });

    this.logger.log(
      `✅ Nouveau Tenant créé : ${result.name} (id=${result.id}, subdomain=${result.subdomain})`,
    );

    return {
      tenantId: result.id,
      tenantSubdomain: result.subdomain,
      adminEmail: pending.email,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // JOB DE PURGE : Supprime les PendingSignup expirés toutes les 10 minutes
  // ────────────────────────────────────────────────────────────────────────────
  async purgeExpiredSignups(): Promise<void> {
    try {
      const result = await this.prisma.pendingSignup.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (result.count > 0) {
        this.logger.log(`🧹 Purge : ${result.count} PendingSignup(s) expirés supprimés.`);
      }
    } catch (err: any) {
      this.logger.error('Erreur lors de la purge des PendingSignup expirés:', err.message);
    }
  }
}
