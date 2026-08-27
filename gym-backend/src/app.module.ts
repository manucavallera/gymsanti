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
import { RoutinesModule } from './routines/routines.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { CoachModule } from './coach/coach.module';

import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { TrainingType, TrainingStage, Exercise, ExerciseLog } from './training/training.entities';
import { Measurement } from './measurements/measurement.entity';
import { Goal } from './goals/goal.entity';
import { Protocol } from './protocols/protocol.entity';
import { Payment } from './payments/payment.entity';
import { Routine, RoutineDay, RoutineExercise, RoutineExerciseLog } from './routines/routine.entities';
import { MealPlan, MealDay, Meal } from './nutrition/nutrition.entities';
import { StockMovement } from './products/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'gymcore.db',
      entities: [
        User, Product,
        TrainingType, TrainingStage, Exercise, ExerciseLog,
        Measurement, Goal, Protocol, Payment,
        Routine, RoutineDay, RoutineExercise, RoutineExerciseLog,
        MealPlan, MealDay, Meal,
        StockMovement,
      ],
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
    RoutinesModule,
    NutritionModule,
    CoachModule,
  ],
})
export class AppModule {}
