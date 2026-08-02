import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    
    // RÈGLE TECHNIQUE CRUCIALE HOSTINGER : Port 465 exige SSL/TLS implicite (secure: true)
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure, // true pour port 465 (SSL implicite Hostinger)
      auth: {
        user: process.env.SMTP_USER || 'kpsydesk.support@kpsyinformatique.com',
        pass: process.env.SMTP_PASS || '',
      },
      tls: {
        // La validation du certificat serveur reste active (protection contre le MITM).
        // Ne désactiver qu'explicitement, en développement, via SMTP_ALLOW_SELF_SIGNED=true.
        rejectUnauthorized: process.env.SMTP_ALLOW_SELF_SIGNED !== 'true',
      }
    });

    this.logger.log(`📧 Service Mailer initialisé sur ${host}:${port} (SSL Implicite: ${isSecure})`);
  }

  async sendOtpCode(toEmail: string, otpCode: string, schoolName: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"KPSyDesk School" <kpsydesk.support@kpsyinformatique.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px; max-width: 550px; margin: auto;">
        <h2 style="color: #38bdf8; text-align: center; margin-bottom: 8px;">KPSyDesk School</h2>
        <p style="text-align: center; color: #94a3b8; font-size: 0.9rem;">Validation de la création d'établissement</p>
        <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
        <p>Bonjour,</p>
        <p>Voici votre code de confirmation à 6 chiffres pour valider l'inscription de l'établissement <strong>${schoolName}</strong> :</p>
        <div style="background-color: #020617; border: 2px solid #38bdf8; padding: 18px; border-radius: 12px; text-align: center; font-size: 2.2rem; font-weight: bold; letter-spacing: 8px; color: #38bdf8; margin: 24px 0;">
          ${otpCode}
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem;">Ce code expire dans 15 minutes. Ne le partagez avec personne.</p>
        <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
        <p style="text-align: center; font-size: 0.75rem; color: #64748b;">© 2026 KPSyDesk School — kpsydesk.support@kpsyinformatique.com</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: `[KPSyDesk School] Votre code de confirmation : ${otpCode}`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email OTP envoyé avec succès à ${toEmail} (ID: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Échec de l'envoi de l'email OTP à ${toEmail}: ${err.message}`, err.stack);
      return false;
    }
  }
}
