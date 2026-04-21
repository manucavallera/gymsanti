import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './product.entity';

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
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(SEED_PRODUCTS.map((p) => this.repo.create(p as any)));
    }
  }

  findAll(category?: ProductCategory) {
    if (category) return this.repo.find({ where: { category, available: true } });
    return this.repo.find({ where: { available: true }, order: { category: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
