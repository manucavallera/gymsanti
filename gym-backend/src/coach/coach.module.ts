import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payments/payment.entity';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { UsersModule } from '../users/users.module';
import { MeasurementsModule } from '../measurements/measurements.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Payment]), UsersModule, MeasurementsModule, GoalsModule],
  providers: [CoachService],
  controllers: [CoachController],
})
export class CoachModule {}
