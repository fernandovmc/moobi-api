import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Account } from '../../generated/prisma';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prismaService: PrismaService) {}

  async findAll(userId: string): Promise<Account[]> {
    return this.prismaService.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.prismaService.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async create(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    return this.prismaService.account.create({
      data: {
        ...createAccountDto,
        userId,
      },
    });
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ): Promise<Account> {
    // Verificar se a conta existe e pertence ao usuário
    await this.findOne(id, userId);

    return this.prismaService.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    // Verificar se a conta existe e pertence ao usuário
    await this.findOne(id, userId);

    // Verificar se há transações associadas
    const transactionCount = await this.prismaService.transaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      throw new ForbiddenException(
        'Cannot delete account with transactions. Delete the transactions first or deactivate the account instead.',
      );
    }

    await this.prismaService.account.delete({
      where: { id },
    });

    return { success: true };
  }

  async deactivate(id: string, userId: string): Promise<Account> {
    // Verificar se a conta existe e pertence ao usuário
    await this.findOne(id, userId);

    return this.prismaService.account.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
