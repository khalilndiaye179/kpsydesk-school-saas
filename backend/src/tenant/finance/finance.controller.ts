import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceService } from './finance.service';

@Controller('tenant/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get('summary')
  getSummary(@Request() req: any, @Query('schoolYear') schoolYear?: string) {
    return this.service.getSummary(req.user.tenantId, schoolYear);
  }

  @Get('fees')
  getFees(
    @Request() req: any,
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('schoolYear') schoolYear?: string,
  ) {
    return this.service.getFees(req.user.tenantId, { studentId, classId, schoolYear });
  }

  @Post('fees')
  createFee(@Request() req: any, @Body() dto: any) {
    return this.service.createFee(req.user.tenantId, dto);
  }

  @Get('fees/:feeId/payments')
  getPayments(@Request() req: any, @Param('feeId') feeId: string) {
    return this.service.getPayments(req.user.tenantId, feeId);
  }

  @Post('payments')
  recordPayment(@Request() req: any, @Body() dto: any) {
    return this.service.recordPayment(req.user.tenantId, dto, req.user.userId);
  }

  @Get('payments/recent')
  getRecentPayments(@Request() req: any, @Query('limit') limit?: string) {
    return this.service.getRecentPayments(req.user.tenantId, limit ? +limit : 20);
  }

  @Get('overdue')
  getOverdue(@Request() req: any) {
    return this.service.getOverdueFees(req.user.tenantId);
  }
}
