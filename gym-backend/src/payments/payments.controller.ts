import { Body, Controller, ForbiddenException, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  // Students only buy from the store here. Fees are recorded by the coach (see CoachController).
  @Post()
  create(@Request() req: any, @Body() body: any) {
    if (!Array.isArray(body?.items) || body.items.length === 0) throw new ForbiddenException('Los pagos los registra tu coach');
    return this.svc.create(req.user.id, body);
  }

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }

}
