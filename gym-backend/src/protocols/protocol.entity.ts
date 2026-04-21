import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type ProtocolCategory = 'nutricion' | 'descanso' | 'entrenamiento' | 'suplementacion' | 'general';

@Entity('protocols')
export class Protocol {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column('text') content: string;
  @Column() category: ProtocolCategory;
  @Column({ default: true }) isPublic: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  coach: User;
  @Column({ nullable: true }) coachId: number;
}
