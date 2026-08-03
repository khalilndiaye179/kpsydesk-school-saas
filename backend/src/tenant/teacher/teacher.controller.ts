import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tenant/teachers')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  findAll(@Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.findAll(tenantId);
  }

  @Post()
  create(@Body() createTeacherDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.create(createTeacherDto, tenantId);
  }
}
