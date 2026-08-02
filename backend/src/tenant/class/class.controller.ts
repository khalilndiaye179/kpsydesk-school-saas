import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ClassService } from './class.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('api/v1/tenant/classes')
@UseGuards(AuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Post()
  create(@Body() createClassDto: Record<string, unknown>, @TenantId() tenantId: string) {
    return this.classService.create(createClassDto, tenantId);
  }
}
