import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Updated Groceries',
    required: false,
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Category type',
    enum: ['income', 'expense'],
    example: 'expense',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: string;

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
