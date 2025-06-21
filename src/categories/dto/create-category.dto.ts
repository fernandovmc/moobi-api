import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: ['income', 'expense'],
    example: 'expense',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['income', 'expense'])
  type: string;

  @ApiProperty({
    description: 'Category color (hex code)',
    example: '#FF5733',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Category icon',
    example: 'shopping-cart',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Whether this is a default category',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
