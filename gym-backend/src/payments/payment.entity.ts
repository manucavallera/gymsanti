import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn() id: number;
  @Column() description: string;
  @Column('decimal', { precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'pendiente' }) status: PaymentStatus;
  @Column({ nullable: true }) method: PaymentMethod;
  @Column({ nullable: true }) period: string;
  @Column({ nullable: true }) dueDate: string;
  @Column({ nullable: true }) paidAt: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column() userId: number;
}
