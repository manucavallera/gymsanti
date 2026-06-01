import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, CreateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) dailyCalories: number;
  @Column({ nullable: true }) dailyProtein: number;
  @Column({ nullable: true }) dailyCarbs: number;
  @Column({ nullable: true }) dailyFats: number;
  @CreateDateColumn() createdAt: Date;

  @Column() studentId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column() coachId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coachId' })
  coach: User;

  @OneToMany(() => MealDay, (d) => d.plan, { cascade: true })
  days: MealDay[];
}

@Entity('meal_days')
export class MealDay {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ default: 0 }) order: number;

  @Column() planId: number;
  @ManyToOne(() => MealPlan, (p) => p.days, { onDelete: 'CASCADE' })
  plan: MealPlan;

  @OneToMany(() => Meal, (m) => m.day, { cascade: true })
  meals: Meal[];
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ nullable: true }) time: string;
  @Column({ nullable: true }) calories: number;
  @Column({ nullable: true }) protein: number;
  @Column({ nullable: true }) carbs: number;
  @Column({ nullable: true }) fats: number;
  @Column({ nullable: true, type: 'text' }) foods: string;
  @Column({ default: 0 }) order: number;

  @Column() dayId: number;
  @ManyToOne(() => MealDay, (d) => d.meals, { onDelete: 'CASCADE' })
  day: MealDay;
}
