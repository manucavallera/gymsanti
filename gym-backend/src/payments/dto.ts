import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta', 'mercadopago'] as const;

// Coach registers a fee for a student. paid=true records it as already collected.
export class CreateStudentPaymentDto {
  @IsString() @MinLength(2, { message: 'Poné una descripción' }) @MaxLength(200) description: string;
  @IsNumber() @Min(1, { message: 'El monto debe ser mayor a 0' }) amount: number;
  @IsOptional() @IsString() @MaxLength(50) period?: string;
  @IsOptional() @IsString() @MaxLength(20) dueDate?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
  @IsOptional() @IsBoolean() paid?: boolean;
  @IsOptional() @IsIn(PAYMENT_METHODS) method?: (typeof PAYMENT_METHODS)[number];
}

export class MarkPaidDto {
  @IsIn(PAYMENT_METHODS, { message: 'Método de pago inválido' }) method: (typeof PAYMENT_METHODS)[number];
}
