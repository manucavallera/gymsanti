import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MealPlan, MealDay, Meal } from './nutrition.entities';
import { CreateDayDto, CreateMealDto, CreatePlanDto, UpdateDayDto, UpdateMealDto, UpdatePlanDto } from './dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(MealPlan) private planRepo: Repository<MealPlan>,
    @InjectRepository(MealDay) private dayRepo: Repository<MealDay>,
    @InjectRepository(Meal) private mealRepo: Repository<Meal>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // ── Coach ──────────────────────────────────────────────────────────────────

  async createPlan(coachId: number, studentId: number, data: CreatePlanDto) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    const plan = this.planRepo.create({ ...data, coachId, studentId });
    return this.planRepo.save(plan);
  }

  async updatePlan(coachId: number, planId: number, data: UpdatePlanDto) {
    const plan = await this.planRepo.findOne({ where: { id: planId, coachId } });
    if (!plan) throw new NotFoundException();
    Object.assign(plan, data);
    return this.planRepo.save(plan);
  }

  async deletePlan(coachId: number, planId: number) {
    await this.planRepo.delete({ id: planId, coachId });
  }

  async getPlanForCoach(coachId: number, planId: number) {
    const plan = await this.planRepo.findOne({
      where: { id: planId, coachId },
      relations: ['days', 'days.meals'],
    });
    if (!plan) throw new NotFoundException();
    plan.days.sort((a, b) => a.order - b.order);
    plan.days.forEach((d) => d.meals.sort((a, b) => a.order - b.order));
    return plan;
  }

  // ── Días ───────────────────────────────────────────────────────────────────

  async addDay(coachId: number, planId: number, data: CreateDayDto) {
    await this.assertCoachOwnsPlan(coachId, planId);
    const day = this.dayRepo.create({ ...data, planId });
    return this.dayRepo.save(day);
  }

  async updateDay(coachId: number, dayId: number, data: UpdateDayDto) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['plan'] });
    if (!day || day.plan.coachId !== coachId) throw new ForbiddenException();
    Object.assign(day, data);
    return this.dayRepo.save(day);
  }

  async deleteDay(coachId: number, dayId: number) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['plan'] });
    if (!day || day.plan.coachId !== coachId) throw new ForbiddenException();
    await this.dayRepo.delete(dayId);
  }

  // ── Comidas ────────────────────────────────────────────────────────────────

  async addMeal(coachId: number, dayId: number, data: CreateMealDto) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['plan'] });
    if (!day || day.plan.coachId !== coachId) throw new ForbiddenException();
    const meal = this.mealRepo.create({ ...data, dayId });
    return this.mealRepo.save(meal);
  }

  async updateMeal(coachId: number, mealId: number, data: UpdateMealDto) {
    const meal = await this.mealRepo.findOne({ where: { id: mealId }, relations: ['day', 'day.plan'] });
    if (!meal || meal.day.plan.coachId !== coachId) throw new ForbiddenException();
    Object.assign(meal, data);
    return this.mealRepo.save(meal);
  }

  async deleteMeal(coachId: number, mealId: number) {
    const meal = await this.mealRepo.findOne({ where: { id: mealId }, relations: ['day', 'day.plan'] });
    if (!meal || meal.day.plan.coachId !== coachId) throw new ForbiddenException();
    await this.mealRepo.delete(mealId);
  }

  // ── Alumno ─────────────────────────────────────────────────────────────────

  async getStudentPlan(studentId: number) {
    const plan = await this.planRepo.findOne({
      where: { studentId },
      relations: ['days', 'days.meals'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    if (!plan) return null;
    plan.days.sort((a, b) => a.order - b.order);
    plan.days.forEach((d) => d.meals.sort((a, b) => a.order - b.order));
    return plan;
  }

  async getAllStudentPlansForCoach(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.planRepo.find({
      where: { studentId, coachId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  private async assertCoachOwnsPlan(coachId: number, planId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId, coachId } });
    if (!plan) throw new ForbiddenException();
    return plan;
  }

  private async assertCoachOwnsStudent(coachId: number, studentId: number) {
    const student = await this.userRepo.findOne({ where: { id: studentId, coachId } });
    if (!student) throw new ForbiddenException('No tenes acceso a este alumno');
  }
}
