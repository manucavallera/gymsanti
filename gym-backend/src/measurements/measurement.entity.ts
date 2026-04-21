import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn() id: number;

  @Column('decimal', { precision: 5, scale: 1, nullable: true }) weight: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) chest: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) waist: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) hips: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) leftArm: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) rightArm: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) leftLeg: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) rightLeg: number;
  @Column('decimal', { precision: 5, scale: 1, nullable: true }) abdomen: number;
  @Column({ nullable: true }) notes: string;

  @CreateDateColumn() date: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column() userId: number;
}
