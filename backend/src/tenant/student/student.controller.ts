import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('api/v1/tenant/students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  findAll(@Req() request: Request) {
    return this.studentService.findAll((request as any).user.tenantId);
  }

  @Post()
  create(@Body() createStudentDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.studentService.create(createStudentDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.studentService.findOne(id, (request as any).user.tenantId);
  }
}
