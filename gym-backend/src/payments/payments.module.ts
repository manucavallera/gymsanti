import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Product } from '../products/product.entity';
import { StockMovement } from '../products/stock-movement.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Product, StockMovement])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
