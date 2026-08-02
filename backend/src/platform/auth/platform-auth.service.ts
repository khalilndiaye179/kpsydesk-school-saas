import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import {
  OTP_MAX_ATTEMPTS,
  compareSecret,
  expiresInMinutes,
  generateOtpCode,
  hashSecret,
} from '../../common/auth/credentials.util';
import { PLATFORM_TOKEN_EXPIRATION } from '../../common/config/jwt.config';

const OTP_TTL_MINUTES = 5;

@Injectable()
export class PlatformAuthService {
  private readonly logger = new Logger(PlatformAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Étape 1: Validation Identifiant / Mot de passe SuperAdmin
   */
  async login(email: string, pass: string) {
    const user = await this.prisma.platformUser.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const isMatch = await compareSecret(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    // Cas A : MFA Non Enrôlé -> Génère un jeton temporaire à scope restreint "platform:enroll"
    if (!user.isMfaEnrolled) {
      const enrollToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          scope: 'platform:enroll',
        },
        { expiresIn: '15m' },
      );

      return {
        status: 'mfa_enrollment_required',
        enroll_token: enrollToken,
        mustChangePassword: user.mustChangePassword,
      };
    }

    // Cas B : MFA Enrôlé + Activé -> Génération d'un OtpChallenge
    const otp = generateOtpCode();
    const codeHash = await hashSecret(otp);
    const expiresAt = expiresInMinutes(OTP_TTL_MINUTES);

    const challenge = await this.prisma.otpChallenge.create({
      data: {
        userId: user.id,
        email: user.email,
        codeHash,
        expiresAt,
      },
    });

    this.logger.log(`🔑 OtpChallenge platform généré pour ${user.email} (id: ${challenge.id})`);

    return {
      status: 'otp_required',
      challenge_id: challenge.id,
      mustChangePassword: user.mustChangePassword,
    };
  }

  /**
   * Étape 2: Validation OTP et délivrance du JWT platform final
   */
  async verifyOtp(challengeId: string, otpCode: string) {
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge || challenge.usedAt) {
      throw new UnauthorizedException('Session de vérification invalide ou déjà utilisée.');
    }

    if (new Date() > challenge.expiresAt) {
      throw new UnauthorizedException('Code de vérification expiré.');
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedException('Nombre maximum de tentatives atteint.');
    }

    const user = await this.prisma.platformUser.findUnique({
      where: { email: challenge.email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    // Si secret TOTP disponible, vérification via speakeasy, sinon bcrypt contre codeHash
    let isValid = false;
    if (user.twoFactorSecret) {
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otpCode,
        window: 1,
      });
    }

    if (!isValid) {
      isValid = await compareSecret(otpCode, challenge.codeHash);
    }

    if (!isValid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: challenge.attempts + 1 },
      });
      throw new UnauthorizedException('Code de vérification incorrect.');
    }

    // Marquer l'OTP comme utilisé
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    });

    // Délivrance du JWT Platform final (scope: "platform")
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scope: 'platform',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: PLATFORM_TOKEN_EXPIRATION,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}
