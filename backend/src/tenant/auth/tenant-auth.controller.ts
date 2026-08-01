import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { TenantAuthService } from './tenant-auth.service';

@Controller('tenant/auth')
export class TenantAuthController {
  constructor(private authService: TenantAuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; pass: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant non spécifié dans les en-têtes');
    }
    return this.authService.login(loginDto.email, loginDto.pass, tenantId);
  }
}
