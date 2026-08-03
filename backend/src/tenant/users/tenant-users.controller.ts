import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';

@Controller('tenant/users')
export class TenantUsersController {
  constructor(private readonly service: TenantUsersService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }
}
