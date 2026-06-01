import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine, RoutineDay, RoutineExercise, RoutineExerciseLog } from './routine.entities';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineDay, RoutineExercise, RoutineExerciseLog])],
  providers: [RoutinesService],
  controllers: [RoutinesController],
  exports: [RoutinesService],
})
export class RoutinesModule {}
