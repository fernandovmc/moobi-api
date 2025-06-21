import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { AuthRequest } from '../users/interfaces/auth-request.interface';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all accounts',
    description: 'Retrieve all accounts for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accounts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              balance: { type: 'number' },
              isActive: { type: 'boolean' },
              userId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(@Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return { accounts: await this.accountsService.findAll(userId) };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Retrieve a specific account by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            balance: { type: 'number' },
            isActive: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findOne(@Param('id') id: string, @Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return { account: await this.accountsService.findOne(id, userId) };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new account',
    description: 'Create a new account for the authenticated user',
  })
  @ApiBody({
    type: CreateAccountDto,
    description: 'Account creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    schema: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            balance: { type: 'number' },
            isActive: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @Req() request: AuthRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return {
      account: await this.accountsService.create(createAccountDto, userId),
      message: 'Account created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an account',
    description: 'Update an existing account by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateAccountDto,
    description: 'Account update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    schema: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            balance: { type: 'number' },
            isActive: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() request: AuthRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return {
      account: await this.accountsService.update(id, updateAccountDto, userId),
      message: 'Account updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an account',
    description: 'Delete an account by its ID (only if no transactions exist)',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete account with existing transactions',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async remove(@Param('id') id: string, @Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.accountsService.remove(id, userId);
  }

  @Put(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate an account',
    description: 'Deactivate an account by setting isActive to false',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            balance: { type: 'number' },
            isActive: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deactivate(@Param('id') id: string, @Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return {
      account: await this.accountsService.deactivate(id, userId),
      message: 'Account deactivated successfully',
    };
  }
}
