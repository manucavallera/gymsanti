import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { decimalTransformer } from '../common/decimal.transformer';
import { User } from '../users/user.entity';

const cm = { precision: 5, scale: 1, nullable: true, transformer: decimalTransformer } as const;

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn() id: number;

  @Column('decimal', cm) weight: number;
  @Column('decimal', cm) height: number;
  // Calculated by the server from weight and height. Never sent by the client.
  @Column('decimal', { precision: 4, scale: 1, nullable: true, transformer: decimalTransformer }) bmi: number;
  @Column('decimal', cm) chest: number;
  @Column('decimal', cm) back: number;
  @Column('decimal', cm) waist: number;
  @Column('decimal', cm) hips: number;
  @Column('decimal', cm) arm: number;
  @Column('decimal', cm) leg: number;
  @Column('integer', { nullable: true }) restingHr: number;
  @Column('integer', { nullable: true }) maxHr: number;
  @Column({ nullable: true }) notes: string;

  @CreateDateColumn() date: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column() userId: number;
}
