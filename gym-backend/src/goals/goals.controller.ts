import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';

// Students only read their goals. The coach manages them (see CoachController).
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly svc: GoalsService) {}

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }
}
