import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly svc: GoalsService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) { return this.svc.create(req.user.id, body); }

  @Get()
  findAll(@Request() req: any) { return this.svc.findAll(req.user.id); }

  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.toggleAchieved(req.user.id, id);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.delete(req.user.id, id);
  }
}
