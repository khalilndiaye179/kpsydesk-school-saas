import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.update(id, updateTeacherDto, tenantId);
  }

  @Post(':id/assign')
  assignToClass(@Param('id') id: string, @Body() body: { classId: string; courseId: string; weeklyHours: number }, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.assignToClass(id, body.classId, body.courseId, body.weeklyHours, tenantId);
  }

  @Post(':id/availabilities')
  updateAvailabilities(@Param('id') id: string, @Body() body: { availabilities: any[] }, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.updateAvailabilities(id, body.availabilities, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.remove(id, tenantId);
  }
}
