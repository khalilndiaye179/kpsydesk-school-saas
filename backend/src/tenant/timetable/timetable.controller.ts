import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('tenant/timetables')
@UseGuards(AuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  findAll() {
    return this.timetableService.findAll();
  }

  @Post()
  create(@Body() createTimetableDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.timetableService.create(createTimetableDto, tenantId);
  }
}
