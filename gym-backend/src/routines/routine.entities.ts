import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, CreateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('routines')
export class Routine {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @CreateDateColumn() createdAt: Date;

  @Column() studentId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column() coachId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coachId' })
  coach: User;

  @OneToMany(() => RoutineDay, (d) => d.routine, { cascade: true })
  days: RoutineDay[];
}

@Entity('routine_days')
export class RoutineDay {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ default: 0 }) order: number;

  @Column() routineId: number;
  @ManyToOne(() => Routine, (r) => r.days, { onDelete: 'CASCADE' })
  routine: Routine;

  @OneToMany(() => RoutineExercise, (e) => e.day, { cascade: true })
  exercises: RoutineExercise[];
}

@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column() sets: number;
  @Column() reps: string;
  @Column({ nullable: true }) weight: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 0 }) order: number;

  @Column() dayId: number;
  @ManyToOne(() => RoutineDay, (d) => d.exercises, { onDelete: 'CASCADE' })
  day: RoutineDay;

  @OneToMany(() => RoutineExerciseLog, (l) => l.exercise)
  logs: RoutineExerciseLog[];
}

@Entity('routine_exercise_logs')
export class RoutineExerciseLog {
  @PrimaryGeneratedColumn() id: number;
  @Column('decimal', { precision: 6, scale: 2 }) weight: number;
  @Column({ nullable: true }) repsActual: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() date: Date;

  @Column() exerciseId: number;
  @ManyToOne(() => RoutineExercise, (e) => e.logs, { onDelete: 'CASCADE' })
  exercise: RoutineExercise;

  @Column() userId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
