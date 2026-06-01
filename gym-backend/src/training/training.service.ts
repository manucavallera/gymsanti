import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingType, TrainingStage, Exercise, ExerciseLog } from './training.entities';

const SEED = [
  {
    name: 'Fuerza', icon: '🏋️', description: 'Programas orientados a aumentar la fuerza máxima.',
    stages: [
      { name: 'Fase 1 — Adaptación', order: 0, exercises: [
        { name: 'Sentadilla con barra', sets: 4, reps: '6-8', notes: 'Bajá hasta paralelo, espalda recta', order: 0 },
        { name: 'Press de banca', sets: 4, reps: '6-8', notes: 'Agarre a la anchura de hombros', order: 1 },
        { name: 'Peso muerto', sets: 3, reps: '5', notes: 'Barra pegada al cuerpo, core apretado', order: 2 },
        { name: 'Press militar', sets: 3, reps: '8', notes: undefined, order: 3 },
      ]},
      { name: 'Fase 2 — Fuerza máxima', order: 1, exercises: [
        { name: 'Sentadilla (heavy)', sets: 5, reps: '3-5', notes: 'Trabajo al 85-90% 1RM', order: 0 },
        { name: 'Press de banca (heavy)', sets: 5, reps: '3-5', notes: 'Trabajo al 85-90% 1RM', order: 1 },
        { name: 'Peso muerto (heavy)', sets: 4, reps: '3', notes: 'Trabajo al 90% 1RM', order: 2 },
        { name: 'Remo con barra', sets: 4, reps: '6', notes: undefined, order: 3 },
      ]},
    ],
  },
  {
    name: 'Hipertrofia', icon: '💪', description: 'Rutinas para máximo crecimiento muscular.',
    stages: [
      { name: 'Tren superior', order: 0, exercises: [
        { name: 'Press inclinado con mancuernas', sets: 4, reps: '10-12', notes: 'Controlá la bajada 3 segundos', order: 0 },
        { name: 'Jalón al pecho', sets: 4, reps: '10-12', notes: undefined, order: 1 },
        { name: 'Cruces en polea', sets: 3, reps: '15', notes: 'Apretá el pecho arriba', order: 2 },
        { name: 'Curl de bíceps', sets: 3, reps: '12-15', notes: undefined, order: 3 },
        { name: 'Extensión de tríceps', sets: 3, reps: '12-15', notes: undefined, order: 4 },
      ]},
      { name: 'Tren inferior', order: 1, exercises: [
        { name: 'Prensa 45°', sets: 4, reps: '12-15', notes: undefined, order: 0 },
        { name: 'Extensión de cuádriceps', sets: 3, reps: '15', notes: undefined, order: 1 },
        { name: 'Curl femoral', sets: 3, reps: '12-15', notes: undefined, order: 2 },
        { name: 'Hip thrust', sets: 4, reps: '12', notes: 'Apretá glúteo arriba del todo', order: 3 },
        { name: 'Gemelos en prensa', sets: 4, reps: '20', notes: undefined, order: 4 },
      ]},
    ],
  },
  {
    name: 'Funcional', icon: '⚡', description: 'Entrenamiento para rendimiento y agilidad.',
    stages: [
      { name: 'Circuito A', order: 0, exercises: [
        { name: 'Burpees', sets: 4, reps: '10', notes: '45 segundos de trabajo, 15 de descanso', order: 0 },
        { name: 'Sentadilla con salto', sets: 3, reps: '12', notes: undefined, order: 1 },
        { name: 'Plancha dinámica', sets: 3, reps: '30 seg', notes: undefined, order: 2 },
        { name: 'Escaladores', sets: 3, reps: '20 cada pierna', notes: undefined, order: 3 },
      ]},
    ],
  },
  {
    name: 'Pérdida de peso', icon: '🔥', description: 'Combinación de fuerza y cardio para quemar grasa.',
    stages: [
      { name: 'HIIT + Fuerza', order: 0, exercises: [
        { name: 'Cinta (intervalos)', sets: 1, reps: '20 min', notes: '1 min rápido / 1 min suave', order: 0 },
        { name: 'Sentadilla goblet', sets: 3, reps: '15', notes: undefined, order: 1 },
        { name: 'Zancadas', sets: 3, reps: '12 cada pierna', notes: undefined, order: 2 },
        { name: 'Remo en máquina', sets: 3, reps: '15', notes: undefined, order: 3 },
        { name: 'Plancha', sets: 3, reps: '45 seg', notes: undefined, order: 4 },
      ]},
    ],
  },
];

@Injectable()
export class TrainingService implements OnModuleInit {
  constructor(
    @InjectRepository(TrainingType) private typeRepo: Repository<TrainingType>,
    @InjectRepository(TrainingStage) private stageRepo: Repository<TrainingStage>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(ExerciseLog) private logRepo: Repository<ExerciseLog>,
  ) {}

  async onModuleInit() {
    const count = await this.typeRepo.count();
    if (count > 0) return;
    for (const t of SEED) {
      const type = await this.typeRepo.save(this.typeRepo.create({ name: t.name, icon: t.icon, description: t.description }));
      for (const s of t.stages) {
        const stage = await this.stageRepo.save(this.stageRepo.create({ name: s.name, order: s.order, trainingTypeId: type.id }));
        for (const e of s.exercises) {
          await this.exerciseRepo.save(this.exerciseRepo.create({ ...e, stageId: stage.id }));
        }
      }
    }
  }

  findAllTypes() {
    return this.typeRepo.find();
  }

  findTypeWithStages(id: number) {
    return this.typeRepo.findOne({ where: { id }, relations: ['stages', 'stages.exercises'] });
  }

  findStageWithExercises(stageId: number) {
    return this.stageRepo.findOne({ where: { id: stageId }, relations: ['exercises'] });
  }

  async logExercise(userId: number, exerciseId: number, weight: number, repsActual?: string, notes?: string) {
    const log = this.logRepo.create({ userId, exerciseId, weight, repsActual, notes });
    return this.logRepo.save(log);
  }

  getExerciseLogs(userId: number, exerciseId: number) {
    return this.logRepo.find({
      where: { userId, exerciseId },
      order: { date: 'DESC' },
      take: 10,
    });
  }

  getLastLog(userId: number, exerciseId: number) {
    return this.logRepo.findOne({ where: { userId, exerciseId }, order: { date: 'DESC' } });
  }
}
