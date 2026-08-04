import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tenant/students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  findAll(@Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.findAll(tenantId);
  }

  @Post()
  create(@Body() createStudentDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.create(createStudentDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.findOne(id, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.update(id, updateStudentDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.remove(id, tenantId);
  }
}
