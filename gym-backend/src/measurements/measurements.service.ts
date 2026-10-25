import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Measurement } from './measurement.entity';
import { CreateMeasurementDto } from './dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
  ) {}

  async create(userId: number, data: CreateMeasurementDto) {
    // Height rarely changes: reuse the last one so BMI works without retyping it.
    let height = data.height;
    if (!height) {
      const last = await this.repo.findOne({ where: { userId, height: Not(IsNull()) }, order: { date: 'DESC', id: 'DESC' } });
      height = last?.height ?? undefined;
    }
    const bmi = data.weight && height ? Math.round((data.weight / (height / 100) ** 2) * 10) / 10 : null;
    const m = this.repo.create({ ...data, height, bmi: bmi as number, userId });
    return this.repo.save(m);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId }, order: { date: 'DESC', id: 'DESC' } });
  }

  findLatest(userId: number) {
    return this.repo.findOne({ where: { userId }, order: { date: 'DESC', id: 'DESC' } });
  }

  async delete(userId: number, id: number) {
    await this.repo.delete({ id, userId });
  }
}
