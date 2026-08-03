import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tenant/timetables')
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  findAll(@Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.timetableService.findAll(tenantId);
  }

  @Post()
  create(@Body() createTimetableDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.timetableService.create(createTimetableDto, tenantId);
  }
}
