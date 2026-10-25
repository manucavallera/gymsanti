import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Goal } from '../goals/goal.entity';
import { Payment } from '../payments/payment.entity';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { UsersModule } from '../users/users.module';
import { MeasurementsModule } from '../measurements/measurements.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Goal, Payment]), UsersModule, MeasurementsModule],
  providers: [CoachService],
  controllers: [CoachController],
})
export class CoachModule {}
