import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

// Each Create/Update pair shares a base without `name`, then declares `name` itself:
// class-validator inherits decorators, so an optional `name` in a parent would make it optional on create too.
// studentId/coachId are never accepted from the body (whitelist strips them).

class PlanFields {
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000) dailyCalories?: number;
  @IsOptional() @IsInt() @Min(0) @Max(1000) dailyProtein?: number;
  @IsOptional() @IsInt() @Min(0) @Max(1500) dailyCarbs?: number;
  @IsOptional() @IsInt() @Min(0) @Max(500) dailyFats?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) waterLiters?: number;
  @IsOptional() @IsString() @MaxLength(3000) vitamins?: string;
  @IsOptional() @IsString() @MaxLength(3000) supplements?: string;
  @IsOptional() @IsString() @MaxLength(3000) nervousSystem?: string;
  @IsOptional() @IsString() @MaxLength(3000) intestinal?: string;
  @IsOptional() @IsString() @MaxLength(3000) habits?: string;
}

export class CreatePlanDto extends PlanFields {
  @IsString() @MinLength(2, { message: 'Poné un nombre al plan' }) @MaxLength(100) name: string;
}

export class UpdatePlanDto extends PlanFields {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
}

class DayFields {
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateDayDto extends DayFields {
  @IsString() @MinLength(1, { message: 'Poné un nombre al día' }) @MaxLength(50) name: string;
}

export class UpdateDayDto extends DayFields {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50) name?: string;
}

class MealFields {
  @IsOptional() @IsString() @MaxLength(20) time?: string;
  @IsOptional() @IsInt() @Min(0) @Max(5000) calories?: number;
  @IsOptional() @IsInt() @Min(0) @Max(500) protein?: number;
  @IsOptional() @IsInt() @Min(0) @Max(800) carbs?: number;
  @IsOptional() @IsInt() @Min(0) @Max(300) fats?: number;
  @IsOptional() @IsString() @MaxLength(2000) foods?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateMealDto extends MealFields {
  @IsString() @MinLength(1, { message: 'Poné un nombre a la comida' }) @MaxLength(50) name: string;
}

export class UpdateMealDto extends MealFields {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50) name?: string;
}
