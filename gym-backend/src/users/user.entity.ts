import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export type UserRole = 'user' | 'coach' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: UserRole;

  @Column({ nullable: true })
  coachId: number;

  @ManyToOne(() => User, (u) => u.students, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coachId' })
  coach: User;

  @OneToMany(() => User, (u) => u.coach)
  students: User[];

  @CreateDateColumn()
  createdAt: Date;
}
