import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type ProtocolCategory = 'nutricion' | 'descanso' | 'entrenamiento' | 'suplementacion' | 'general';
export type ProtocolSectionType = 'heading' | 'text' | 'list' | 'note' | 'image';

export interface ProtocolSection {
  id: string;
  type: ProtocolSectionType;
  title?: string;
  content: string;
}

@Entity('protocols')
export class Protocol {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column('text') content: string;
  @Column('simple-json', { nullable: true }) sections: ProtocolSection[];
  @Column() category: ProtocolCategory;
  @Column({ default: true }) isPublic: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  coach: User;
  @Column({ nullable: true }) coachId: number;
}
