import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  private getTransporter(): nodemailer.Transporter {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error('CRITICAL SMTP CONFIGURATION ERROR: SMTP_USER and SMTP_PASS environment variables are required for sending emails.');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendOtpCode(toEmail: string, otpCode: string, schoolName: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"KPSyDesk School" <kpsydesk.support@kpsyinformatique.com>';
    const { generateTenantCodeSlug } = require('../common/utils/tenant-code.util');
    const tenantCode = generateTenantCodeSlug(schoolName);
    const initialLoginId = `${tenantCode}-0001`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px; max-width: 580px; margin: auto; border: 1px solid #1e293b;">
        <h2 style="color: #38bdf8; text-align: center; margin-bottom: 4px; font-size: 1.8rem;">KPSyDesk School</h2>
        <p style="text-align: center; color: #94a3b8; font-size: 0.9rem; margin-top: 0;">Portail d'Accès Scolaire SaaS</p>
        <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
        
        <p>Bonjour,</p>
        <p>Vous avez initié la création de l'établissement scolaire <strong>${schoolName}</strong>.</p>
        
        <!-- ENCADRÉ IDENTIFIANT INITIAL -->
        <div style="background-color: #032b45; border: 1px solid #0284c7; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
          <span style="color: #38bdf8; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">
            🔑 VOTRE IDENTIFIANT DE CONNEXION UNIQUE (DIRECTEUR)
          </span>
          <span style="font-size: 1.5rem; font-family: monospace; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
            ${initialLoginId}
          </span>
          <p style="color: #93c5fd; font-size: 0.8rem; margin: 8px 0 0 0;">
            Conservez cet identifiant ! Il sera votre clé de connexion exclusive à votre espace d'administration.
          </p>
        </div>

        <p>Voici votre code de validation à 6 chiffres pour finaliser l'inscription :</p>
        <div style="background-color: #020617; border: 2px solid #38bdf8; padding: 18px; border-radius: 12px; text-align: center; font-size: 2.2rem; font-weight: bold; letter-spacing: 8px; color: #38bdf8; margin: 20px 0;">
          ${otpCode}
        </div>

        <p style="color: #94a3b8; font-size: 0.85rem;">Ce code expire dans 15 minutes. Ne le partagez avec personne.</p>
        <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
        <p style="text-align: center; font-size: 0.75rem; color: #64748b;">© 2026 KPSyDesk School — kpsydesk.support@kpsyinformatique.com</p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: `[KPSyDesk School] Code OTP : ${otpCode} | Identifiant : ${initialLoginId}`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email OTP + Identifiant initial ${initialLoginId} envoyé avec succès à ${toEmail} (ID: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Échec de l'envoi de l'email OTP à ${toEmail}: ${err.message}`, err.stack);
      return false;
    }
  }
}
