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

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.teacherService.remove(id, tenantId);
  }
}
