import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Updated Bank Account',
    required: false,
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Account type',
    enum: ['checking', 'savings', 'credit'],
    example: 'savings',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['checking', 'savings', 'credit'])
  type?: string;

  @ApiProperty({
    description: 'Account balance',
    example: 2500.75,
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  balance?: number;

  @ApiProperty({
    description: 'Account active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
