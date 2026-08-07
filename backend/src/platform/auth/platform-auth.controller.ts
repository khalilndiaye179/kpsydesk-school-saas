import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PlatformAuthService } from './platform-auth.service';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password?: string; pass?: string }) {
    const userPassword = body.password || body.pass || '';
    return this.authService.login(body.email, userPassword);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { challenge_id: string; otp_code: string }) {
    return this.authService.verifyOtp(body.challenge_id, body.otp_code);
  }
}
