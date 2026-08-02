import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TenantClassesService } from './tenant-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tenant/classes')
export class TenantClassesController {
  constructor(private classesService: TenantClassesService) {}

  @Get()
  async findAll() {
    return this.classesService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; code: string }, @TenantId() tenantId: string) {
    return this.classesService.create({ name: body.name, code: body.code }, tenantId);
  }
}
