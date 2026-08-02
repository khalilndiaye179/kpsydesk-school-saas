import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaEnrollTokenGuard } from '../../common/guards/mfa-enroll-token.guard';
import { Request } from 'express';

@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  /**
   * POST /api/v1/mfa/enroll
   * Génère le secret TOTP, le persiste en DB et renvoie le QR code.
   * Guard : scope JWT doit être strictement "platform:enroll".
   */
  @Post('enroll')
  @UseGuards(MfaEnrollTokenGuard)
  @HttpCode(HttpStatus.OK)
  async enroll(@Req() req: Request) {
    const user = req['user'];
    return this.mfaService.generateEnrollment(user.id, user.email);
  }

  /**
   * POST /api/v1/mfa/confirm-enrollment
   * Vérifie le code TOTP via le secret persisté en DB.
   * Active isMfaEnrolled = true et isTwoFactorEnabled = true de manière synchronisée.
   * Guard : scope JWT doit être strictement "platform:enroll".
   */
  @Post('confirm-enrollment')
  @UseGuards(MfaEnrollTokenGuard)
  @HttpCode(HttpStatus.OK)
  async confirmEnrollment(
    @Req() req: Request,
    @Body() body: { totp_code: string },
  ) {
    const user = req['user'];
    return this.mfaService.confirmEnrollment(user.id, body.totp_code);
  }
}
