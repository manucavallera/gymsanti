import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string, role?: 'user' | 'coach', coachId?: number) {
    const user = await this.usersService.create(email, name, password, role, coachId);
    const token = this.signToken(user.id, user.email);
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const token = this.signToken(user.id, user.email);
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async updateProfile(userId: number, data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    if (data.newPassword) {
      if (!data.currentPassword) throw new UnauthorizedException('Ingresá tu contraseña actual');
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Contraseña actual incorrecta');
      user.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (data.name) user.name = data.name;
    await this.usersService.save(user);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    await this.usersService.deleteById(userId);
  }

  async coachAccessStatus(): Promise<{ available: boolean }> {
    const exists = await this.usersService.coachExists();
    return { available: !exists };
  }

  async activateCoach(userId: number, secret: string): Promise<{ token: string; user: object }> {
    const SETUP_SECRET = process.env.SETUP_SECRET || 'gymcoach_secret';

    if (secret !== SETUP_SECRET) throw new UnauthorizedException('Contraseña incorrecta');

    const alreadyExists = await this.usersService.coachExists();
    if (alreadyExists) throw new ConflictException('Ya existe un coach registrado');

    const user = await this.usersService.promoteToCoach(userId);
    const token = this.signToken(user.id, user.email);
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  private signToken(userId: number, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
}
