import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('tenant/courses')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Post()
  create(@Body() createCourseDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.courseService.create(createCourseDto, tenantId);
  }
}
