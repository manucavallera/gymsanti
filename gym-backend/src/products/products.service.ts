import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './product.entity';
import { StockMovement, StockMovementType } from './stock-movement.entity';

const SEED_PRODUCTS = [
  { name: 'Whey Protein Chocolate', description: 'Proteína de suero de leche, 2kg. 24g de proteína por porción. Sin azúcar agregada.', price: 12500, category: 'suplementos', imageEmoji: '🥛' },
  { name: 'Creatina Monohidrato', description: 'Creatina pura micronizada, 500g. Aumenta la fuerza y recuperación muscular.', price: 7800, category: 'suplementos', imageEmoji: '💊' },
  { name: 'Pre-Workout Explosivo', description: 'Fórmula pre-entrenamiento con cafeína, beta-alanina y citrulina. 300g.', price: 9200, category: 'suplementos', imageEmoji: '⚡' },
  { name: 'BCAA Sandía', description: 'Aminoácidos ramificados 2:1:1 con electrolitos. 400g. Ideal para recuperación.', price: 6400, category: 'suplementos', imageEmoji: '🍉' },
  { name: 'Vitamina D3 + K2', description: 'Combo de vitamina D3 (5000 UI) y K2 (100mcg). 60 cápsulas. Salud ósea y hormonal.', price: 3200, category: 'vitaminas', imageEmoji: '🌞' },
  { name: 'Magnesio Bisglicinato', description: 'Magnesio altamente absorbible. 90 cápsulas. Mejora el sueño y la recuperación.', price: 2800, category: 'vitaminas', imageEmoji: '🌙' },
  { name: 'Omega 3 Alta Concentración', description: 'EPA 600mg + DHA 400mg por cápsula. 90 softgels. Antiinflamatorio natural.', price: 4100, category: 'vitaminas', imageEmoji: '🐟' },
  { name: 'Multivitamínico Sport', description: 'Complejo vitamínico diseñado para deportistas. 30 packs diarios. Todo en uno.', price: 5600, category: 'vitaminas', imageEmoji: '💪' },
  { name: 'Brownie Proteico', description: 'Brownie de chocolate con 20g de proteína y solo 5g de azúcar. Caja x6 unidades.', price: 2400, category: 'dulces', imageEmoji: '🍫' },
  { name: 'Alfajor Proteico', description: 'Alfajor de maicena relleno con dulce de leche proteico. 60g. 18g de proteína.', price: 900, category: 'dulces', imageEmoji: '🍪' },
  { name: 'Barra de Cereal Proteica', description: 'Barra con avena, miel y whey. 40g. 15g de proteína. Sin conservantes.', price: 750, category: 'dulces', imageEmoji: '🌾' },
  { name: 'Mousse Proteico Frutilla', description: 'Postre listo para consumir. 200g. 25g de proteína. Refrigerado.', price: 1100, category: 'dulces', imageEmoji: '🍓' },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      const entities = SEED_PRODUCTS.map((p) => Object.assign(this.repo.create(), p));
      await this.repo.save(entities);
    }
  }

  findAll(category?: ProductCategory) {
    if (category) return this.repo.find({ where: { category, available: true } });
    return this.repo.find({ where: { available: true }, order: { category: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findAllAdmin() {
    return this.repo.find({ order: { available: 'DESC', category: 'ASC', name: 'ASC' } });
  }

  async create(data: Partial<Product>) {
    this.validateProduct(data);
    return this.repo.save(this.repo.create({ ...data, stock: data.stock ?? 0 }));
  }

  async update(id: number, data: Partial<Product>) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    this.validateProduct(data, true);
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async hide(id: number) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.repo.update(id, { available: false });
    return { success: true };
  }

  getMovements(productId: number) {
    return this.movementRepo.find({ where: { productId }, order: { createdAt: 'DESC' } });
  }

  async addMovement(productId: number, userId: number, data: { type: StockMovementType; quantity: number; reason?: string }) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (!['entrada', 'salida', 'ajuste'].includes(data.type) || !Number.isInteger(data.quantity) || data.quantity < 0) {
      throw new BadRequestException('Movimiento de stock inválido');
    }
    if ((data.type === 'entrada' || data.type === 'salida') && data.quantity === 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }
    const nextStock = data.type === 'entrada' ? product.stock + data.quantity : data.type === 'salida' ? product.stock - data.quantity : data.quantity;
    if (nextStock < 0) throw new ConflictException('Stock insuficiente');
    await this.repo.update(productId, { stock: nextStock });
    return this.movementRepo.save(this.movementRepo.create({ ...data, productId, userId, reason: data.reason || '' }));
  }

  private validateProduct(data: Partial<Product>, partial = false) {
    const categories: ProductCategory[] = ['suplementos', 'vitaminas', 'dulces'];
    if (!partial && !data.name?.trim()) throw new BadRequestException('El nombre es obligatorio');
    if (data.name !== undefined && !data.name.trim()) throw new BadRequestException('El nombre es obligatorio');
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) throw new BadRequestException('Precio inválido');
    if (data.stock !== undefined && (!Number.isInteger(data.stock) || data.stock < 0)) throw new BadRequestException('Stock inválido');
    if (data.category !== undefined && !categories.includes(data.category as ProductCategory)) throw new BadRequestException('Categoría inválida');
  }
}
