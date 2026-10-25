import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Routine, RoutineDay, RoutineExercise, RoutineExerciseLog } from './routine.entities';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineDay, RoutineExercise, RoutineExerciseLog, User])],
  providers: [RoutinesService],
  controllers: [RoutinesController],
  exports: [RoutinesService],
})
export class RoutinesModule {}
