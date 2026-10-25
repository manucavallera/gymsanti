import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly repo: Repository<Goal>,
  ) {}

  create(userId: number, data: CreateGoalDto) {
    const g = this.repo.create({ ...data, userId });
    return this.repo.save(g);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async toggleAchieved(userId: number, id: number) {
    const goal = await this.repo.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Objetivo no encontrado');
    goal.achieved = !goal.achieved;
    return this.repo.save(goal);
  }

  async delete(userId: number, id: number) {
    await this.repo.delete({ id, userId });
  }
}
