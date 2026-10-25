import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { MealPlan, MealDay, Meal } from './nutrition.entities';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan, MealDay, Meal, User])],
  providers: [NutritionService],
  controllers: [NutritionController],
  exports: [NutritionService],
})
export class NutritionModule {}
