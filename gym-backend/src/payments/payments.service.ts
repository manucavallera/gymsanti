import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Product } from '../products/product.entity';
import { StockMovement } from '../products/stock-movement.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, data: Partial<Payment> & { items?: { productId: number; quantity: number }[] }) {
    if (!data.items?.length) {
      const p = this.repo.create({ ...data, userId });
      delete (p as Payment & { items?: unknown }).items;
      return this.repo.save(p);
    }
    const ids = data.items.map((item) => item.productId);
    if (new Set(ids).size !== ids.length || data.items.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new BadRequestException('Carrito inválido');
    }
    return this.dataSource.transaction(async (manager) => {
      const products = await Promise.all(data.items!.map((item) => manager.findOne(Product, { where: { id: item.productId } })));
      products.forEach((product, index) => {
        if (!product || !product.available) throw new BadRequestException('Producto no disponible');
        if (product.stock < data.items![index].quantity) throw new ConflictException(`Stock insuficiente para ${product.name}`);
      });
      for (let index = 0; index < products.length; index++) {
        const product = products[index]!;
        const quantity = data.items![index].quantity;
        product.stock -= quantity;
        await manager.save(Product, product);
        await manager.save(StockMovement, manager.create(StockMovement, { type: 'salida', quantity, reason: 'Compra en tienda', productId: product.id, userId }));
      }
      const p = manager.create(Payment, { ...data, userId });
      delete (p as Payment & { items?: unknown }).items;
      return manager.save(Payment, p);
    });
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
