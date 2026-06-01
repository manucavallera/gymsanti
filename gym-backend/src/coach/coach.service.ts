import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Measurement } from '../measurements/measurement.entity';
import { Goal } from '../goals/goal.entity';
import { Payment } from '../payments/payment.entity';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Measurement) private measurementRepo: Repository<Measurement>,
    @InjectRepository(Goal) private goalRepo: Repository<Goal>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
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

  async assignStudent(coachId: number, studentId: number) {
    if (coachId === studentId) throw new ForbiddenException();
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Usuario no encontrado');
    student.coachId = coachId;
    return this.userRepo.save(student);
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
    return this.measurementRepo.find({
      where: { userId: studentId },
      order: { date: 'DESC' },
    });
  }

  async getStudentGoals(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.goalRepo.find({
      where: { userId: studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentPayments(coachId: number, studentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    return this.paymentRepo.find({ where: { userId: studentId }, order: { createdAt: 'DESC' } });
  }

  async createStudentPayment(coachId: number, studentId: number, data: Partial<Payment>) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    const p = this.paymentRepo.create({ ...data, userId: studentId });
    return this.paymentRepo.save(p);
  }

  async markStudentPaymentPaid(coachId: number, studentId: number, paymentId: number, method: string) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    const p = await this.paymentRepo.findOne({ where: { id: paymentId, userId: studentId } });
    if (!p) return null;
    p.status = 'pagado';
    p.method = method as any;
    p.paidAt = new Date().toISOString();
    return this.paymentRepo.save(p);
  }

  async deleteStudentPayment(coachId: number, studentId: number, paymentId: number) {
    await this.assertCoachOwnsStudent(coachId, studentId);
    await this.paymentRepo.delete({ id: paymentId, userId: studentId });
  }

  private async assertCoachOwnsStudent(coachId: number, studentId: number) {
    const student = await this.userRepo.findOne({ where: { id: studentId, coachId } });
    if (!student) throw new ForbiddenException('No tenes acceso a este alumno');
  }
}
