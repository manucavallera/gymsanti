import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const GOAL_CATEGORIES = ['peso', 'fuerza', 'medidas', 'habito', 'otro'] as const;

export class CreateGoalDto {
  @IsString() @MinLength(2, { message: 'Poné un título' }) @MaxLength(150) title: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsIn(GOAL_CATEGORIES, { message: 'Categoría inválida' }) category: (typeof GOAL_CATEGORIES)[number];
  @IsOptional() @IsString() @MaxLength(100) targetValue?: string;
  @IsOptional() @IsString() @MaxLength(20) targetDate?: string;
}
