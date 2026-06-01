import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  create(userId: number, data: Partial<Payment>) {
    const p = this.repo.create({ ...data, userId });
    return this.repo.save(p);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markPaid(userId: number, id: number, method: string) {
    const p = await this.repo.findOne({ where: { id, userId } });
    if (!p) return null;
    p.status = 'pagado';
    p.method = method as any;
    p.paidAt = new Date().toISOString();
    return this.repo.save(p);
  }

  async delete(userId: number, id: number) {
    await this.repo.delete({ id, userId });
  }
}
