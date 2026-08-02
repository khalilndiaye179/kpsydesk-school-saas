import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TenantClassesService } from './tenant-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('tenant/classes')
export class TenantClassesController {
  constructor(private classesService: TenantClassesService) {}

  @Get()
  async findAll(@Req() request: Request) {
    return this.classesService.findAll((request as any).user.tenantId);
  }

  @Post()
  async create(@Body() body: { name: string; code: string }, @Req() request: Request) {
    return this.classesService.create(body.name, body.code, (request as any).user.tenantId);
  }
}
