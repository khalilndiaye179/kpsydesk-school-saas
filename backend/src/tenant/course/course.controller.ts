import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('api/v1/tenant/courses')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Post()
  create(@Body() createCourseDto: Record<string, unknown>, @TenantId() tenantId: string) {
    return this.courseService.create(createCourseDto, tenantId);
  }
}
