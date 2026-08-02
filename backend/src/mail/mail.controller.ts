import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test-smtp')
  async testSmtp(@Query('to') toEmail?: string) {
    const target = toEmail || 'kpsydesk.support@kpsyinformatique.com';
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
    const hasPass = Boolean(process.env.SMTP_PASS);

    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const success = await this.mailService.sendOtpCode(target, testCode, 'Établissement Test KPSyDesk');

    return {
      status: success ? 'SUCCESS' : 'FAILED',
      message: success 
        ? `✅ Email de test envoyé avec succès à ${target} via Hostinger Port 465 SSL !` 
        : `❌ Échec de l'envoi de l'email à ${target}. Vérifiez les variables d'environnement SMTP.`,
      config: {
        host,
        port,
        isSecure,
        user: process.env.SMTP_USER || 'kpsydesk.support@kpsyinformatique.com',
        hasPasswordConfigured: hasPass,
        sentTo: target,
        otpCodeSent: testCode,
      }
    };
  }
}
