import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

// Same pattern as nutrition/dto.ts: shared optional fields in a base class, `name` declared
// in each subclass so it stays required on create. Unknown fields (id, studentId, coachId, userId)
// are stripped by the global whitelist ValidationPipe.

class RoutineFields {
  @IsOptional() @IsString() @MaxLength(500) description?: string;
}

export class CreateRoutineDto extends RoutineFields {
  @IsString() @MinLength(2, { message: 'Poné un nombre a la rutina' }) @MaxLength(100) name: string;
}

export class UpdateRoutineDto extends RoutineFields {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
}

class DayFields {
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateRoutineDayDto extends DayFields {
  @IsString() @MinLength(1, { message: 'Poné un nombre al día' }) @MaxLength(50) name: string;
}

export class UpdateRoutineDayDto extends DayFields {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50) name?: string;
}

class ExerciseFields {
  @IsOptional() @IsString() @MaxLength(30) weight?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateExerciseDto extends ExerciseFields {
  @IsString() @MinLength(1, { message: 'Poné un nombre al ejercicio' }) @MaxLength(100) name: string;
  @IsInt({ message: 'Las series tienen que ser un número' }) @Min(1) @Max(50) sets: number;
  @IsString() @MinLength(1) @MaxLength(30) reps: string;
}

export class UpdateExerciseDto extends ExerciseFields {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) name?: string;
  @IsOptional() @IsInt() @Min(1) @Max(50) sets?: number;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(30) reps?: string;
}

export class LogExerciseDto {
  @IsNumber({}, { message: 'Poné el peso en kg' }) @Min(0) @Max(1000) weight: number;
  @IsOptional() @IsString() @MaxLength(30) repsActual?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
