import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly svc: TrainingService) {}

  @Get('types')
  findAllTypes() { return this.svc.findAllTypes(); }

  @Get('types/:id')
  findType(@Param('id', ParseIntPipe) id: number) { return this.svc.findTypeWithStages(id); }

  @Get('stages/:id')
  findStage(@Param('id', ParseIntPipe) id: number) { return this.svc.findStageWithExercises(id); }

  @Post('log')
  @UseGuards(JwtAuthGuard)
  logExercise(
    @Request() req: any,
    @Body() body: { exerciseId: number; weight: number; repsActual?: string; notes?: string },
  ) {
    return this.svc.logExercise(req.user.id, body.exerciseId, body.weight, body.repsActual, body.notes);
  }

  @Get('log/:exerciseId')
  @UseGuards(JwtAuthGuard)
  getLogs(@Request() req: any, @Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.svc.getExerciseLogs(req.user.id, exerciseId);
  }

  @Get('log/:exerciseId/last')
  @UseGuards(JwtAuthGuard)
  getLastLog(@Request() req: any, @Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.svc.getLastLog(req.user.id, exerciseId);
  }
}
