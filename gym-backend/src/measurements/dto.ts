import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateMeasurementDto {
  @IsOptional() @IsNumber() @Min(20) @Max(400) weight?: number;
  @IsOptional() @IsNumber() @Min(80) @Max(250) height?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) chest?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) back?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) waist?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) hips?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(150) arm?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(150) leg?: number;
  @IsOptional() @IsInt() @Min(20) @Max(250) restingHr?: number;
  @IsOptional() @IsInt() @Min(60) @Max(250) maxHr?: number;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
