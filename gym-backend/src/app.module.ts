import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TrainingModule } from './training/training.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { GoalsModule } from './goals/goals.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { TrainingType, TrainingStage, Exercise, ExerciseLog } from './training/training.entities';
import { Measurement } from './measurements/measurement.entity';
import { Goal } from './goals/goal.entity';
import { Protocol } from './protocols/protocol.entity';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'gymcore.db',
      entities: [User, Product, TrainingType, TrainingStage, Exercise, ExerciseLog, Measurement, Goal, Protocol, Payment],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    TrainingModule,
    MeasurementsModule,
    GoalsModule,
    ProtocolsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
