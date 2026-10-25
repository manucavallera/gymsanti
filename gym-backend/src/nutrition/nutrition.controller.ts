import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoachGuard } from '../auth/coach.guard';
import { NutritionService } from './nutrition.service';
import { CreateDayDto, CreateMealDto, CreatePlanDto, UpdateDayDto, UpdateMealDto, UpdatePlanDto } from './dto';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly svc: NutritionService) {}

  // ── Alumno ─────────────────────────────────────────────────────────────────

  @Get('my')
  getMyPlan(@Request() req: any) {
    return this.svc.getStudentPlan(req.user.id);
  }

  // ── Coach: planes ──────────────────────────────────────────────────────────

  @UseGuards(CoachGuard)
  @Get('coach/students/:studentId/all')
  getStudentPlans(@Request() req: any, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.svc.getAllStudentPlansForCoach(req.user.id, studentId);
  }

  @UseGuards(CoachGuard)
  @Post('coach/students/:studentId')
  createPlan(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreatePlanDto,
  ) {
    return this.svc.createPlan(req.user.id, studentId, body);
  }

  @UseGuards(CoachGuard)
  @Get('coach/:planId')
  getPlan(@Request() req: any, @Param('planId', ParseIntPipe) planId: number) {
    return this.svc.getPlanForCoach(req.user.id, planId);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/:planId')
  updatePlan(
    @Request() req: any,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() body: UpdatePlanDto,
  ) {
    return this.svc.updatePlan(req.user.id, planId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/:planId')
  deletePlan(@Request() req: any, @Param('planId', ParseIntPipe) planId: number) {
    return this.svc.deletePlan(req.user.id, planId);
  }

  // ── Coach: días ────────────────────────────────────────────────────────────

  @UseGuards(CoachGuard)
  @Post('coach/:planId/days')
  addDay(
    @Request() req: any,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() body: CreateDayDto,
  ) {
    return this.svc.addDay(req.user.id, planId, body);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/days/:dayId')
  updateDay(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: UpdateDayDto,
  ) {
    return this.svc.updateDay(req.user.id, dayId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/days/:dayId')
  deleteDay(@Request() req: any, @Param('dayId', ParseIntPipe) dayId: number) {
    return this.svc.deleteDay(req.user.id, dayId);
  }

  // ── Coach: comidas ─────────────────────────────────────────────────────────

  @UseGuards(CoachGuard)
  @Post('coach/days/:dayId/meals')
  addMeal(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: CreateMealDto,
  ) {
    return this.svc.addMeal(req.user.id, dayId, body);
  }

  @UseGuards(CoachGuard)
  @Patch('coach/meals/:mealId')
  updateMeal(
    @Request() req: any,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Body() body: UpdateMealDto,
  ) {
    return this.svc.updateMeal(req.user.id, mealId, body);
  }

  @UseGuards(CoachGuard)
  @Delete('coach/meals/:mealId')
  deleteMeal(@Request() req: any, @Param('mealId', ParseIntPipe) mealId: number) {
    return this.svc.deleteMeal(req.user.id, mealId);
  }
}
