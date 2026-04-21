import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeasurementsService } from './measurements.service';

@Controller('measurements')
@UseGuards(JwtAuthGuard)
export class MeasurementsController {
  constructor(private readonly svc: MeasurementsService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.id, body);
  }

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }

  @Get('latest')
  findLatest(@Request() req: any) { return this.svc.findLatest(req.user.id); }

  @Delete(':id')
  delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.delete(req.user.id, id);
  }
}
