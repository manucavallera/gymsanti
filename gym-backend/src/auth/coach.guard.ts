import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Runs after JwtAuthGuard, so req.user is already set.
@Injectable()
export class CoachGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = context.switchToHttp().getRequest().user?.role;
    if (role !== 'coach' && role !== 'admin') throw new ForbiddenException('Solo coaches');
    return true;
  }
}
