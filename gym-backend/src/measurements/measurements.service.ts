import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './measurement.entity';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) {}

  create(userId: number, data: Partial<Measurement>) {
    const m = this.repo.create({ ...data, userId });
    return this.repo.save(m);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId }, order: { date: 'DESC' } });
  }

  findLatest(userId: number) {
    return this.repo.findOne({ where: { userId }, order: { date: 'DESC' } });
  }

  async delete(userId: number, id: number) {
    await this.repo.delete({ id, userId });
  }
}
