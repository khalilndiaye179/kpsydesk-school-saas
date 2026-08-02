import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('api/v1/tenant/timetables')
@UseGuards(AuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  findAll() {
    return this.timetableService.findAll();
  }

  @Post()
  create(@Body() createTimetableDto: Record<string, unknown>, @TenantId() tenantId: string) {
    return this.timetableService.create(createTimetableDto, tenantId);
  }
}
