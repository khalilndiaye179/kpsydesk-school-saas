import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PublicSignupService, RequestVerificationDto, VerifyOtpDto } from './signup.service';

@Controller('tenants/signup')
export class PublicSignupController {
  constructor(private readonly signupService: PublicSignupService) {}

  /**
   * POST /api/v1/tenants/signup/request-verification
   * Étape 1 : Valide les données, vérifie le subdomain, envoie l'OTP par email.
   * Rejette explicitement toute tentative d'utiliser le canal SMS.
   */
  @Post('request-verification')
  @HttpCode(HttpStatus.CREATED)
  async requestVerification(@Body() body: RequestVerificationDto) {
    // Sécurité supplémentaire : rejet SMS au niveau contrôleur avant même le service
    if (body.verificationChannel === 'sms') {
      throw new BadRequestException(
        "Le canal SMS n'est pas encore disponible. Utilisez le canal Email.",
      );
    }

    return this.signupService.requestVerification(body);
  }

  /**
   * POST /api/v1/tenants/signup/verify
   * Étape 2 : Vérifie l'OTP, revalide le plan, crée le Tenant + TenantUser + TenantSettings.
   */
  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.signupService.verifyOtp(body);
  }
}
