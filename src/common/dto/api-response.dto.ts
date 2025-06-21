import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Response data',
  })
  data?: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message?: string;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success?: boolean;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
} 