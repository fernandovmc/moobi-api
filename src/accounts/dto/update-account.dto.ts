import { IsOptional, IsString, IsIn, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['checking', 'savings', 'credit'])
  type?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  balance?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 