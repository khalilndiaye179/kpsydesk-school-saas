import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { TenantAuthService } from './tenant-auth.service';

@Controller('tenant/auth')
export class TenantAuthController {
  constructor(private authService: TenantAuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; pass: string; tenantId?: string },
    @Headers('x-tenant-id') headerTenantId: string,
    @Req() req: Request,
  ) {
    const tenantId = headerTenantId || loginDto.tenantId;
    const host = req.headers.host || '';
    return this.authService.login(loginDto.email, loginDto.pass, tenantId, host);
  }
}

