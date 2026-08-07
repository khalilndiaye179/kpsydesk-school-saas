import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';

const BCRYPT_ROUNDS = 12;

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

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    // Génération et délivrance directe du jeton JWT platform SuperAdmin
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scope: 'platform',
    };
    
    const tokenSecret = process.env.JWT_SECRET;
    const accessToken = await this.jwtService.signAsync(payload, { secret: tokenSecret, expiresIn: '12h' });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
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

    if (challenge.attempts >= 5) {
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
      isValid = await bcrypt.compare(otpCode, challenge.codeHash);
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

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '8h' });

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
