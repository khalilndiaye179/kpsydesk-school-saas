import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ClassService } from './class.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('api/v1/tenant/classes')
@UseGuards(AuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  findAll(@Req() request: Request) {
    return this.classService.findAll((request as any).user.tenantId);
  }

  @Post()
  create(@Body() createClassDto: any, @Req() request: Request) {
    const tenantId = (request as any).user.tenantId;
    return this.classService.create(createClassDto, tenantId);
  }
}
