import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tenant/students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Post()
  create(@Body() createStudentDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.create(createStudentDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }
}
