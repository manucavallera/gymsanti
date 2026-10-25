import { IsEmail, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'El nombre es muy corto' })
  name: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsIn(['user', 'coach'])
  role?: 'user' | 'coach';

  @IsOptional()
  @IsInt()
  coachId?: number;

  // Required when role is 'coach'. Must match SETUP_SECRET.
  @IsOptional()
  @IsString()
  coachCode?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  password: string;
}
