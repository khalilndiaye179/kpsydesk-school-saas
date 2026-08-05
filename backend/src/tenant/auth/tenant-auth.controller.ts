import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { TenantAuthService } from './tenant-auth.service';

@Controller('tenant/auth')
export class TenantAuthController {
  constructor(private authService: TenantAuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { username: string; pass: string },
  ) {
    return this.authService.login(loginDto.username, loginDto.pass);
  }
}

