import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoachGuard } from '../auth/coach.guard';
import { RoutinesService } from './routines.service';
import { CreateExerciseDto, CreateRoutineDayDto, CreateRoutineDto, LogExerciseDto, UpdateExerciseDto, UpdateRoutineDayDto, UpdateRoutineDto } from './dto';

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
    @Body() body: LogExerciseDto,
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

  @UseGuards(CoachGuard)
  @Get('coach/students/:studentId/all')
  getStudentRoutines(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.svc.getAllStudentRoutinesForCoach(req.user.id, studentId);
  }

  @UseGuards(CoachGuard)
  @Post('coach/students/:studentId')
  createRoutine(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateRoutineDto,
  ) {
    return this.svc.createRoutine(req.user.id, studentId, body);
  }

  @UseGuards(CoachGuard)
  @Get('coach/:routineId')
  getRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
  ) {
    return this.svc.getRoutineForCoach(req.user.id, routineId);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/:routineId')
  updateRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
    @Body() body: UpdateRoutineDto,
  ) {
    return this.svc.updateRoutine(req.user.id, routineId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/:routineId')
  deleteRoutine(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
  ) {
    return this.svc.deleteRoutine(req.user.id, routineId);
  }

  // ── Coach: días ────────────────────────────────────────────────────────────

  @UseGuards(CoachGuard)
  @Post('coach/:routineId/days')
  addDay(
    @Request() req: any,
    @Param('routineId', ParseIntPipe) routineId: number,
    @Body() body: CreateRoutineDayDto,
  ) {
    return this.svc.addDay(req.user.id, routineId, body);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/days/:dayId')
  updateDay(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: UpdateRoutineDayDto,
  ) {
    return this.svc.updateDay(req.user.id, dayId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/days/:dayId')
  deleteDay(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
  ) {
    return this.svc.deleteDay(req.user.id, dayId);
  }

  // ── Coach: ejercicios ──────────────────────────────────────────────────────

  @UseGuards(CoachGuard)
  @Post('coach/days/:dayId/exercises')
  addExercise(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: CreateExerciseDto,
  ) {
    return this.svc.addExercise(req.user.id, dayId, body);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/exercises/:exerciseId')
  updateExercise(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() body: UpdateExerciseDto,
  ) {
    return this.svc.updateExercise(req.user.id, exerciseId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/exercises/:exerciseId')
  deleteExercise(
    @Request() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.svc.deleteExercise(req.user.id, exerciseId);
  }
}
