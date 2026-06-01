import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.name, dto.password, dto.role, dto.coachId);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return req.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; currentPassword?: string; newPassword?: string },
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Request() req: any) {
    return this.authService.deleteAccount(req.user.id);
  }

  @Post('coach-access')
  @UseGuards(JwtAuthGuard)
  coachAccess(@Request() req: any, @Body() body: { secret: string }) {
    return this.authService.activateCoach(req.user.id, body.secret);
  }

  @Get('coach-access/status')
  coachAccessStatus() {
    return this.authService.coachAccessStatus();
  }
}
