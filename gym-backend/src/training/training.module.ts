import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingType, TrainingStage, Exercise, ExerciseLog } from './training.entities';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType, TrainingStage, Exercise, ExerciseLog])],
  providers: [TrainingService],
  controllers: [TrainingController],
})
export class TrainingModule {}
