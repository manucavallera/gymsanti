import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Measurement } from '../measurements/measurement.entity';
import { Goal } from '../goals/goal.entity';
import { Payment } from '../payments/payment.entity';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Measurement, Goal, Payment])],
  providers: [CoachService],
  controllers: [CoachController],
})
export class CoachModule {}
