import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TenantClassesService } from './tenant-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tenant/classes')
export class TenantClassesController {
  constructor(private classesService: TenantClassesService) {}

  @Get()
  async findAll() {
    return this.classesService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; code: string }) {
    return this.classesService.create(body.name, body.code);
  }
}
