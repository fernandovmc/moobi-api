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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { AuthRequest } from '../users/interfaces/auth-request.interface';

@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async findAll(@Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return { accounts: await this.accountsService.findAll(userId) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return { account: await this.accountsService.findOne(id, userId) };
  }

  @Post()
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
  async remove(@Param('id') id: string, @Req() request: AuthRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.accountsService.remove(id, userId);
  }

  @Put(':id/deactivate')
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
