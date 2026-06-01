import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine, RoutineDay, RoutineExercise, RoutineExerciseLog } from './routine.entities';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine) private routineRepo: Repository<Routine>,
    @InjectRepository(RoutineDay) private dayRepo: Repository<RoutineDay>,
    @InjectRepository(RoutineExercise) private exerciseRepo: Repository<RoutineExercise>,
    @InjectRepository(RoutineExerciseLog) private logRepo: Repository<RoutineExerciseLog>,
  ) {}

  // ── Coach: gestión de rutinas ──────────────────────────────────────────────

  async createRoutine(coachId: number, studentId: number, data: { name: string; description?: string }) {
    const r = this.routineRepo.create({ ...data, coachId, studentId });
    return this.routineRepo.save(r);
  }

  async updateRoutine(coachId: number, routineId: number, data: { name?: string; description?: string }) {
    const r = await this.routineRepo.findOne({ where: { id: routineId, coachId } });
    if (!r) throw new NotFoundException();
    Object.assign(r, data);
    return this.routineRepo.save(r);
  }

  async deleteRoutine(coachId: number, routineId: number) {
    await this.routineRepo.delete({ id: routineId, coachId });
  }

  async getRoutineForCoach(coachId: number, routineId: number) {
    const r = await this.routineRepo.findOne({
      where: { id: routineId, coachId },
      relations: ['days', 'days.exercises'],
    });
    if (!r) throw new NotFoundException();
    r.days.sort((a, b) => a.order - b.order);
    r.days.forEach((d) => d.exercises.sort((a, b) => a.order - b.order));
    return r;
  }

  // ── Días ──────────────────────────────────────────────────────────────────

  async addDay(coachId: number, routineId: number, data: { name: string; order?: number }) {
    await this.assertCoachOwnsRoutine(coachId, routineId);
    const d = this.dayRepo.create({ ...data, routineId });
    return this.dayRepo.save(d);
  }

  async updateDay(coachId: number, dayId: number, data: { name?: string; order?: number }) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['routine'] });
    if (!day || day.routine.coachId !== coachId) throw new ForbiddenException();
    Object.assign(day, data);
    return this.dayRepo.save(day);
  }

  async deleteDay(coachId: number, dayId: number) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['routine'] });
    if (!day || day.routine.coachId !== coachId) throw new ForbiddenException();
    await this.dayRepo.delete(dayId);
  }

  // ── Ejercicios ─────────────────────────────────────────────────────────────

  async addExercise(coachId: number, dayId: number, data: {
    name: string; sets: number; reps: string; weight?: string; notes?: string; order?: number;
  }) {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['routine'] });
    if (!day || day.routine.coachId !== coachId) throw new ForbiddenException();
    const ex = this.exerciseRepo.create({ ...data, dayId });
    return this.exerciseRepo.save(ex);
  }

  async updateExercise(coachId: number, exerciseId: number, data: {
    name?: string; sets?: number; reps?: string; weight?: string; notes?: string; order?: number;
  }) {
    const ex = await this.exerciseRepo.findOne({ where: { id: exerciseId }, relations: ['day', 'day.routine'] });
    if (!ex || ex.day.routine.coachId !== coachId) throw new ForbiddenException();
    Object.assign(ex, data);
    return this.exerciseRepo.save(ex);
  }

  async deleteExercise(coachId: number, exerciseId: number) {
    const ex = await this.exerciseRepo.findOne({ where: { id: exerciseId }, relations: ['day', 'day.routine'] });
    if (!ex || ex.day.routine.coachId !== coachId) throw new ForbiddenException();
    await this.exerciseRepo.delete(exerciseId);
  }

  // ── Alumno: ver su rutina ─────────────────────────────────────────────────

  async getStudentRoutine(studentId: number) {
    const routine = await this.routineRepo.findOne({
      where: { studentId },
      relations: ['days', 'days.exercises', 'days.exercises.logs'],
      order: { createdAt: 'DESC' },
    });
    if (!routine) return null;
    routine.days.sort((a, b) => a.order - b.order);
    routine.days.forEach((d) => d.exercises.sort((a, b) => a.order - b.order));
    return routine;
  }

  async getAllStudentRoutines(studentId: number) {
    return this.routineRepo.find({
      where: { studentId },
      relations: ['days'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllStudentRoutinesForCoach(coachId: number, studentId: number) {
    return this.routineRepo.find({
      where: { studentId, coachId },
      relations: ['days'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Logs de progreso ──────────────────────────────────────────────────────

  async logExercise(userId: number, exerciseId: number, data: {
    weight: number; repsActual?: string; notes?: string;
  }) {
    const log = this.logRepo.create({ ...data, exerciseId, userId });
    return this.logRepo.save(log);
  }

  async getExerciseLogs(userId: number, exerciseId: number) {
    return this.logRepo.find({
      where: { exerciseId, userId },
      order: { date: 'DESC' },
      take: 20,
    });
  }

  async getStudentProgress(studentId: number) {
    const routine = await this.routineRepo.findOne({
      where: { studentId },
      relations: ['days', 'days.exercises'],
      order: { createdAt: 'DESC' },
    });
    if (!routine) return [];

    const result: { exerciseId: number; exerciseName: string; dayName: string; logs: { date: Date; weight: number }[] }[] = [];
    routine.days.sort((a, b) => a.order - b.order);
    for (const day of routine.days) {
      day.exercises.sort((a, b) => a.order - b.order);
      for (const ex of day.exercises) {
        const logs = await this.logRepo.find({
          where: { exerciseId: ex.id, userId: studentId },
          order: { date: 'ASC' },
          take: 20,
        });
        if (logs.length > 0) {
          result.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            dayName: day.name,
            logs: logs.map((l) => ({ date: l.date, weight: Number(l.weight) })),
          });
        }
      }
    }
    return result;
  }

  private async assertCoachOwnsRoutine(coachId: number, routineId: number) {
    const r = await this.routineRepo.findOne({ where: { id: routineId, coachId } });
    if (!r) throw new ForbiddenException();
    return r;
  }
}
