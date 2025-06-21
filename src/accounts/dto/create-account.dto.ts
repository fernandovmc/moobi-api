import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Main Bank Account',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Account type',
    enum: ['checking', 'savings', 'credit'],
    example: 'checking',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['checking', 'savings', 'credit'])
  type: string;

  @ApiProperty({
    description: 'Initial account balance',
    example: 1000.50,
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  balance?: number;
}
