import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeasurementsService } from './measurements.service';

// Students only read their measurements. The coach creates and deletes them (see CoachController).
@Controller('measurements')
@UseGuards(JwtAuthGuard)
export class MeasurementsController {
  constructor(private readonly svc: MeasurementsService) {}

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }

  @Get('latest')
  findLatest(@Request() req: any) { return this.svc.findLatest(req.user.id); }
}
