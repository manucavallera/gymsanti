import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) { return this.svc.create(req.user.id, body); }

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }

  @Patch(':id/pay')
  markPaid(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: { method: string }) {
    return this.svc.markPaid(req.user.id, id, body.method);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.delete(req.user.id, id);
  }
}
