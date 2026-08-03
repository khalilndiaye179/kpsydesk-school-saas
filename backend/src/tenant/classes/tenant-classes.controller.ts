import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TenantClassesService } from './tenant-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('tenant/classes')
export class TenantClassesController {
  constructor(private classesService: TenantClassesService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const tenantId = (req as any).user.tenantId;
    return this.classesService.findAll(tenantId);
  }

  @Post()
  async create(@Body() body: { name: string; code: string }, @Req() req: Request) {
    const tenantId = (req as any).user.tenantId;
    return this.classesService.create(body.name, body.code, tenantId);
  }
}
