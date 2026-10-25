import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Payment } from '../payments/payment.entity';
import { UsersService } from '../users/users.service';
import { MeasurementsService } from '../measurements/measurements.service';
import { CreateMeasurementDto } from '../measurements/dto';
import { CreateStudentPaymentDto } from '../payments/dto';
import { GoalsService } from '../goals/goals.service';
import { CreateGoalDto } from '../goals/dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private readonly usersService: UsersService,
    private readonly measurementsService: MeasurementsService,
    private readonly goalsService: GoalsService,
  ) {}

  async getMyStudents(coachId: number) {
    return this.userRepo.find({
      where: { coachId },
      select: ['id', 'email', 'name', 'role', 'createdAt'],
      order: { name: 'ASC' },
    });
  }

  async getStudent(coachId: number, studentId: number) {
    const student = await this.userRepo.findOne({
      where: { id: studentId, coachId },
      select: ['id', 'email', 'name', 'role', 'createdAt'],
    });
    if (!student) throw new NotFoundException('Alumno no encontrado');
    return student;
  }

  // Students do not self-register: the coach creates the login and hands it over.
  async createStudent(coachId: number, data: { email: string; name: string; password: string }) {
    const u = await this.usersService.create(data.email.trim().toLowerCase(), data.name.trim(), data.password, 'user', coachId);
    return { id: u.id, email: u.email, name: u.name, role: u.role, coachId: u.coachId, createdAt: u.createdAt };
  }

  async setStudentPassword(coachId: number, studentId: number, password: string) {
    const student = await this.userRepo.findOne({ where: { id: studentId, coachId } });
    if (!student) throw new ForbiddenException('No tenes acceso a este alumno');
    student.password = await bcrypt.hash(password, 10);
    await this.userRepo.save(student);
    return { ok: true };
  }

  async assignStudent(coachId: number, studentId: number) {
    if (coachId === studentId) throw new ForbiddenException();
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Usuario no encontrado');
    if (student.role !== 'user') throw new BadRequestException('Solo se pueden asignar alumnos');
    if (student.coachId && student.coachId !== coachId) throw new ConflictException('El alumno ya tiene otro coach');
    student.coachId = coachId;
    const saved = await this.userRepo.save(student);
    return { id: saved.id, email: saved.email, name: saved.name, role: saved.role, coachId: saved.coachId };
  }

  private async assertCoachOwnsStudent(coachId: number, studentId: number) {
    const student = await this.userRepo.findOne({ where: { id: studentId, coachId } });
    if (!student) throw new ForbiddenException('No tenes acceso a este alumno');
  }

  async removeStudent(coachId: number, studentId: number) {
    const student = await this.userRepo.findOne({ where: { id: studentId, coachId } });
    if (!student) throw new NotFoundException();
    student.coachId = null as any;
    await this.userRepo.save(student);
  }

  async getPublicCoaches() {
    return this.userRepo.find({
      where: [{ role: 'coach' }, { role: 'admin' }],
      select: ['id', 'name', 'email'],
      order: { name: 'ASC' },
    });
  }

  async getAllUsers() {
    return this.userRepo.find({
      select: ['id', 'email', 'name', 'role', 'coachId', 'createdAt'],
      order: { name: 'ASC' },
    });
  }

  async changeUserRole(adminId: number, userId: number, role: UserRole) {
    if (adminId === userId) throw new ForbiddenException('No podes cambiar tu propio rol');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.role = role;
    const saved = await this.userRepo.save(user);
    return { id: saved.id, email: saved.email, name: saved.name, role: saved.role };
  }

  async getStudentMeasurements(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.measurementsService.findAll(studentId);
  }

  async createStudentMeasurement(coachId: number, studentId: number, data: CreateMeasurementDto) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.measurementsService.create(studentId, data);
  }

  async deleteStudentMeasurement(coachId: number, studentId: number, measurementId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    await this.measurementsService.delete(studentId, measurementId);
  }

  async getStudentGoals(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.goalsService.findAll(studentId);
  }

  async createStudentGoal(coachId: number, studentId: number, data: CreateGoalDto) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.goalsService.create(studentId, data);
  }

  async toggleStudentGoal(coachId: number, studentId: number, goalId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.goalsService.toggleAchieved(studentId, goalId);
  }

  async deleteStudentGoal(coachId: number, studentId: number, goalId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    await this.goalsService.delete(studentId, goalId);
  }

  async getStudentPayments(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.paymentRepo.find({ where: { userId: studentId }, order: { createdAt: 'DESC' } });
  }

  async createStudentPayment(coachId: number, studentId: number, data: CreateStudentPaymentDto) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    const { paid, method, ...rest } = data;
    const p = this.paymentRepo.create({
      ...rest,
      userId: studentId,
      ...(paid ? { status: 'pagado' as const, method: method ?? 'efectivo', paidAt: new Date().toISOString() } : {}),
    });
    return this.paymentRepo.save(p);
  }

  async markStudentPaymentPaid(coachId: number, studentId: number, paymentId: number, method: string) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    const p = await this.paymentRepo.findOne({ where: { id: paymentId, userId: studentId } });
    if (!p) throw new NotFoundException('Pago no encontrado');
    p.status = 'pagado';
    p.method = method as any;
    p.paidAt = new Date().toISOString();
    return this.paymentRepo.save(p);
  }

  async deleteStudentPayment(coachId: number, studentId: number, paymentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    await this.paymentRepo.delete({ id: paymentId, userId: studentId });
  }
}
