import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NutritionService } from './nutrition.service';

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

  @Get('coach/students/:studentId/all')
  getStudentPlans(@Request() req: any, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.svc.getAllStudentPlansForCoach(req.user.id, studentId);
  }

  @Post('coach/students/:studentId')
  createPlan(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: { name: string; description?: string; dailyCalories?: number; dailyProtein?: number; dailyCarbs?: number; dailyFats?: number },
  ) {
    return this.svc.createPlan(req.user.id, studentId, body);
  }

  @Get('coach/:planId')
  getPlan(@Request() req: any, @Param('planId', ParseIntPipe) planId: number) {
    return this.svc.getPlanForCoach(req.user.id, planId);
  }

  @Patch('coach/:planId')
  updatePlan(
    @Request() req: any,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() body: { name?: string; description?: string; dailyCalories?: number; dailyProtein?: number; dailyCarbs?: number; dailyFats?: number },
  ) {
    return this.svc.updatePlan(req.user.id, planId, body);
  }

  @Delete('coach/:planId')
  deletePlan(@Request() req: any, @Param('planId', ParseIntPipe) planId: number) {
    return this.svc.deletePlan(req.user.id, planId);
  }

  // ── Coach: días ────────────────────────────────────────────────────────────

  @Post('coach/:planId/days')
  addDay(
    @Request() req: any,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() body: { name: string; order?: number },
  ) {
    return this.svc.addDay(req.user.id, planId, body);
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
  deleteDay(@Request() req: any, @Param('dayId', ParseIntPipe) dayId: number) {
    return this.svc.deleteDay(req.user.id, dayId);
  }

  // ── Coach: comidas ─────────────────────────────────────────────────────────

  @Post('coach/days/:dayId/meals')
  addMeal(
    @Request() req: any,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() body: { name: string; time?: string; calories?: number; protein?: number; carbs?: number; fats?: number; foods?: string; order?: number },
  ) {
    return this.svc.addMeal(req.user.id, dayId, body);
  }

  @Patch('coach/meals/:mealId')
  updateMeal(
    @Request() req: any,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Body() body: { name?: string; time?: string; calories?: number; protein?: number; carbs?: number; fats?: number; foods?: string; order?: number },
  ) {
    return this.svc.updateMeal(req.user.id, mealId, body);
  }

  @Delete('coach/meals/:mealId')
  deleteMeal(@Request() req: any, @Param('mealId', ParseIntPipe) mealId: number) {
    return this.svc.deleteMeal(req.user.id, mealId);
  }
}
