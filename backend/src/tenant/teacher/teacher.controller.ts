import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('tenant/teachers')
@UseGuards(AuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Post()
  create(@Body() createTeacherDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.create(createTeacherDto, tenantId);
  }
}
