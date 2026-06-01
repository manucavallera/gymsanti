import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(email: string, name: string, password: string, role?: 'user' | 'coach', coachId?: number): Promise<User> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, name, password: hashed, role: role || 'user', coachId: coachId || null as any });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(user: User) {
    return this.repo.save(user);
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async coachExists(): Promise<boolean> {
    const count = await this.repo.count({ where: { role: 'coach' } });
    return count > 0;
  }

  async promoteToCoach(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new Error('Usuario no encontrado');
    user.role = 'coach';
    return this.repo.save(user);
  }
}
