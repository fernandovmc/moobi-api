import { IsNotEmpty, IsString, IsIn, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['checking', 'savings', 'credit'])
  type: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  balance?: number;
} 