import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EvaluationsService } from './evaluations.service';

@Controller('tenant/evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('classId') classId?: string,
    @Query('courseId') courseId?: string,
    @Query('semester') semester?: string,
  ) {
    return this.service.findAll(req.user.tenantId, { classId, courseId, semester: semester ? +semester : undefined });
  }

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.service.create(req.user.tenantId, dto);
  }

  @Get(':id/grades')
  getGrades(@Request() req: any, @Param('id') evaluationId: string) {
    return this.service.getGrades(req.user.tenantId, evaluationId);
  }

  @Put(':id/grades')
  upsertGrades(@Request() req: any, @Param('id') evaluationId: string, @Body() dto: { grades: { studentId: string; score: number | null; comment?: string }[] }) {
    return this.service.upsertGrades(req.user.tenantId, evaluationId, dto.grades);
  }

  @Get('averages/:classId')
  getClassAverages(@Request() req: any, @Param('classId') classId: string, @Query('semester') semester?: string) {
    return this.service.getClassAverages(req.user.tenantId, classId, semester ? +semester : 1);
  }
}
