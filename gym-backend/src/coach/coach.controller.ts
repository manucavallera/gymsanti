import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Request, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoachService } from './coach.service';
import { UserRole } from '../users/user.entity';

function assertCoach(req: any) {
  if (req.user.role !== 'coach' && req.user.role !== 'admin') throw new ForbiddenException();
}

function assertAdmin(req: any) {
  if (req.user.role !== 'admin') throw new ForbiddenException();
}

@Controller('coach')
export class CoachController {
  constructor(private readonly svc: CoachService) {}

  @Get('public/coaches')
  getPublicCoaches() {
    return this.svc.getPublicCoaches();
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  getMyStudents(@Request() req: any) {
    assertCoach(req);
    return this.svc.getMyStudents(req.user.id);
  }

  @Get('students/:id')
  @UseGuards(JwtAuthGuard)
  getStudent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertCoach(req);
    return this.svc.getStudent(req.user.id, id);
  }

  @Get('students/:id/measurements')
  @UseGuards(JwtAuthGuard)
  getStudentMeasurements(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertCoach(req);
    return this.svc.getStudentMeasurements(req.user.id, id);
  }

  @Get('students/:id/goals')
  @UseGuards(JwtAuthGuard)
  getStudentGoals(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertCoach(req);
    return this.svc.getStudentGoals(req.user.id, id);
  }

  @Post('students/:id/assign')
  @UseGuards(JwtAuthGuard)
  assignStudent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertCoach(req);
    return this.svc.assignStudent(req.user.id, id);
  }

  @Delete('students/:id')
  @UseGuards(JwtAuthGuard)
  removeStudent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertCoach(req);
    return this.svc.removeStudent(req.user.id, id);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getAllUsers(@Request() req: any) {
    assertCoach(req);
    return this.svc.getAllUsers();
  }

  @Patch('admin/users/:id/role')
  @UseGuards(JwtAuthGuard)
  changeUserRole(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
  ) {
    assertAdmin(req);
    return this.svc.changeUserRole(req.user.id, id, body.role);
  }

  @Get('students/:studentId/payments')
  @UseGuards(JwtAuthGuard)
  getStudentPayments(@Request() req: any, @Param('studentId', ParseIntPipe) studentId: number) {
    assertCoach(req);
    return this.svc.getStudentPayments(req.user.id, studentId);
  }

  @Post('students/:studentId/payments')
  @UseGuards(JwtAuthGuard)
  createStudentPayment(@Request() req: any, @Param('studentId', ParseIntPipe) studentId: number, @Body() body: any) {
    assertCoach(req);
    return this.svc.createStudentPayment(req.user.id, studentId, body);
  }

  @Patch('students/:studentId/payments/:paymentId/pay')
  @UseGuards(JwtAuthGuard)
  markStudentPaymentPaid(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() body: { method: string },
  ) {
    assertCoach(req);
    return this.svc.markStudentPaymentPaid(req.user.id, studentId, paymentId, body.method);
  }

  @Delete('students/:studentId/payments/:paymentId')
  @UseGuards(JwtAuthGuard)
  deleteStudentPayment(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    assertCoach(req);
    return this.svc.deleteStudentPayment(req.user.id, studentId, paymentId);
  }
}
