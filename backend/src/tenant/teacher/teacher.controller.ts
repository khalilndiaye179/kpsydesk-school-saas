import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('api/v1/tenant/teachers')
@UseGuards(AuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Post()
  create(@Body() createTeacherDto: Record<string, unknown>, @TenantId() tenantId: string) {
    return this.teacherService.create(createTeacherDto, tenantId);
  }
}
