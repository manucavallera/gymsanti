import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type ProductCategory = 'suplementos' | 'vitaminas' | 'dulces';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  category: ProductCategory;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  imageEmoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
