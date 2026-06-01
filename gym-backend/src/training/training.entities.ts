import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, CreateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('training_types')
export class TrainingType {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column('text') description: string;
  @Column() icon: string;
  @OneToMany(() => TrainingStage, (s) => s.trainingType, { cascade: true })
  stages: TrainingStage[];
}

@Entity('training_stages')
export class TrainingStage {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ default: 0 }) order: number;
  @ManyToOne(() => TrainingType, (t) => t.stages, { onDelete: 'CASCADE' })
  trainingType: TrainingType;
  @Column() trainingTypeId: number;
  @OneToMany(() => Exercise, (e) => e.stage, { cascade: true })
  exercises: Exercise[];
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column() sets: number;
  @Column() reps: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 0 }) order: number;
  @ManyToOne(() => TrainingStage, (s) => s.exercises, { onDelete: 'CASCADE' })
  stage: TrainingStage;
  @Column() stageId: number;
  @OneToMany(() => ExerciseLog, (l) => l.exercise)
  logs: ExerciseLog[];
}

@Entity('exercise_logs')
export class ExerciseLog {
  @PrimaryGeneratedColumn() id: number;
  @Column('decimal', { precision: 6, scale: 2 }) weight: number;
  @Column({ nullable: true }) repsActual: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() date: Date;
  @ManyToOne(() => Exercise, (e) => e.logs, { onDelete: 'CASCADE' })
  exercise: Exercise;
  @Column() exerciseId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column() userId: number;
}
