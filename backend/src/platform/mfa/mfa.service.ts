import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as speakeasy from 'speakeasy';
import * as crypto from 'crypto';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly algorithm = 'aes-256-gcm';

  constructor(private prisma: PrismaService) {}

  /**
   * Obtient la clé de chiffrement AES-256 de 32 octets à partir de MFA_ENCRYPTION_KEY
   */
  private getEncryptionKey(): Buffer {
    const rawKey = process.env.MFA_ENCRYPTION_KEY;
    if (!rawKey) {
      throw new Error('CRITICAL SECURITY ERROR: MFA_ENCRYPTION_KEY environment variable is missing.');
    }
    return crypto.scryptSync(rawKey, 'salt_kpsyschool_mfa', 32);
  }

  /**
   * Chiffre la clé secrète TOTP avec AES-256-GCM
   */
  encryptSecret(plainText: string): string {
    const iv = crypto.randomBytes(12);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Déchiffre la clé secrète TOTP
   */
  decryptSecret(cipherText: string): string {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new BadRequestException('Format de clé de chiffrement MFA invalide.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const key = this.getEncryptionKey();

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Génère les éléments d'enrôlement TOTP (Secret Base32 & QR Code URL)
   * Persiste le secret chiffré en DB (isMfaEnrolled reste false) pour
   * que confirmEnrollment puisse le relire sans état mémoire.
   */
  async generateEnrollment(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `KPsySchool:${email}`,
      issuer: 'KPsySchool',
    });

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url || '')}`;

    // Persiste le secret chiffré en DB en attendant la confirmation TOTP.
    // isMfaEnrolled reste false jusqu'à confirmEnrollment.
    const encryptedSecret = this.encryptSecret(secret.base32);
    await this.prisma.platformUser.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret },
    });

    return {
      secret: secret.base32,
      qr_code_url: qrCodeUrl,
    };
  }

  /**
   * Valide le premier code TOTP à 6 chiffres et active le MFA sur le compte.
   * Lit le secret depuis la DB (persisté lors de generateEnrollment).
   */
  async confirmEnrollment(userId: string, totpCode: string) {
    const user = await this.prisma.platformUser.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      throw new BadRequestException(
        'Aucun secret TOTP trouvé. Relancez la procédure d\'enrôlement.',
      );
    }

    const secretBase32 = this.decryptSecret(user.twoFactorSecret);

    const isValid = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!isValid) {
      throw new UnauthorizedException(
        'Code TOTP invalide. Vérifiez l\'heure de votre téléphone.',
      );
    }

    // Activation complète : les deux colonnes sont synchronisées
    await this.prisma.platformUser.update({
      where: { id: userId },
      data: {
        isMfaEnrolled: true,
        isTwoFactorEnabled: true,
        mustChangePassword: false,
        // twoFactorSecret déjà chiffré en DB depuis generateEnrollment
      },
    });

    return {
      status: 'success',
      message: 'Double authentification MFA/TOTP activée avec succès.',
    };
  }
}
