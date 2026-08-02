import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('api/v1/tenant/students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Post()
  create(@Body() createStudentDto: Record<string, unknown>, @TenantId() tenantId: string) {
    return this.studentService.create(createStudentDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }
}
