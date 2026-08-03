import { Controller, Get, Post, Body, Req, Headers } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { Request } from 'express';

@Controller('tenant/users')
export class TenantUsersController {
  constructor(private readonly service: TenantUsersService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: any, @Req() req: Request, @Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = (req as any).user?.tenantId || tenantIdHeader;
    return this.service.create(body, tenantId);
  }
}
