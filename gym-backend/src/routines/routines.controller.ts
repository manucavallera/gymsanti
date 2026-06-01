import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoutinesService } from './routines.service';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly svc: RoutinesService) {}

  // ── Alumno ─────────────────────────────────────────────────────────────────

  @Get('my')
  getMyRoutine(@Request() req: any) {
    return this.svc.getStudentRoutine(req.user.id);
  }

  @Get('my/all')
  getAllMyRoutines(@Request() req: any) {
    return this.svc.getAllStudentRoutines(req.user.id);
  }

  @Get('my/progress')
  getMyProgress(@Request() req: any) {
    return this.svc.getStudentProgress(req.user.id);
  }

  @Post('exercises/:exerciseId/log')
  logExercise(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() body: { weight: number; repsActual?: string; notes?: string },
  ) {
    return this.svc.logExercise(req.user.id, exerciseId, body);
  }

  @Get('exercises/:exerciseId/logs')
  getExerciseLogs(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.svc.getExerciseLogs(req.user.id, exerciseId);
  }

  // ── Coach: rutinas ─────────────────────────────────────────────────────────

  @Get('coach/students/:studentId/all')
  getStudentRoutines(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.svc.getAllStudentRoutinesForCoach(req.user.id, studentId);
  }

  @Post('coach/students/:studentId')
  createRoutine(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: { name: string; description?: string },
  ) {
    return this.svc.createRoutine(req.user.id, studentId, body);
  }

  @Get('coach/:routineId')
  getRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
  ) {
    return this.svc.getRoutineForCoach(req.user.id, routineId);
  }

  @Patch('coach/:routineId')
  updateRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.svc.updateRoutine(req.user.id, routineId, body);
  }

  @Delete('coach/:routineId')
  deleteRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
  ) {
    return this.svc.deleteRoutine(req.user.id, routineId);
  }

  // ── Coach: días ────────────────────────────────────────────────────────────

  @Post('coach/:routineId/days')
  addDay(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
    @Body() body: { name: string; order?: number },
  ) {
    return this.svc.addDay(req.user.id, routineId, body);
  }

  @Patch('coach/days/:dayId')
  updateDay(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: { name?: string; order?: number },
  ) {
    return this.svc.updateDay(req.user.id, dayId, body);
  }

  @Delete('coach/days/:dayId')
  deleteDay(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
  ) {
    return this.svc.deleteDay(req.user.id, dayId);
  }

  // ── Coach: ejercicios ──────────────────────────────────────────────────────

  @Post('coach/days/:dayId/exercises')
  addExercise(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: { name: string; sets: number; reps: string; weight?: string; notes?: string; order?: number },
  ) {
    return this.svc.addExercise(req.user.id, dayId, body);
  }

  @Patch('coach/exercises/:exerciseId')
  updateExercise(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() body: { name?: string; sets?: number; reps?: string; weight?: string; notes?: string; order?: number },
  ) {
    return this.svc.updateExercise(req.user.id, exerciseId, body);
  }

  @Delete('coach/exercises/:exerciseId')
  deleteExercise(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.svc.deleteExercise(req.user.id, exerciseId);
  }
}
