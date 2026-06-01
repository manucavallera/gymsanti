import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type GoalCategory = 'peso' | 'fuerza' | 'medidas' | 'habito' | 'otro';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column('text', { nullable: true }) description: string;
  @Column() category: GoalCategory;
  @Column({ nullable: true }) targetValue: string;
  @Column({ nullable: true }) targetDate: string;
  @Column({ default: false }) achieved: boolean;
  @CreateDateColumn() createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column() userId: number;
}
