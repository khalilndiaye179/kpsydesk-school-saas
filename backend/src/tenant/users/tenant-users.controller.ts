import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tenant/users')
@UseGuards(JwtAuthGuard)
export class TenantUsersController {
  constructor(private readonly service: TenantUsersService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: any, @Req() req: Request) {
    // tenantId extrait EXCLUSIVEMENT du token JWT authentifié
    const tenantId = (req as any).user?.tenantId;
    return this.service.create(body, tenantId);
  }
}
