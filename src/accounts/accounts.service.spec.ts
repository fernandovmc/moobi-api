import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    account: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all accounts for a user', async () => {
      const userId = 'user-id';
      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Checking Account',
          type: 'checking',
          balance: 1000,
          userId,
        },
        {
          id: 'account-2',
          name: 'Savings Account',
          type: 'savings',
          balance: 5000,
          userId,
        },
      ];

      mockPrismaService.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.findAll(userId);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('findOne', () => {
    it('should return an account by ID if it belongs to the user', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const mockAccount = {
        id: accountId,
        name: 'Checking Account',
        type: 'checking',
        balance: 1000,
        userId,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await service.findOne(accountId, userId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      const userId = 'user-id';
      const accountId = 'non-existent-id';

      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.findOne(accountId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
    });

    it('should throw ForbiddenException if account does not belong to the user', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const mockAccount = {
        id: accountId,
        name: 'Checking Account',
        type: 'checking',
        balance: 1000,
        userId: 'different-user-id',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      await expect(service.findOne(accountId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
    });
  });

  describe('create', () => {
    const createAccountDto: CreateAccountDto = {
      name: 'New Account',
      type: 'checking',
      balance: 500,
      color: '#FF5733',
    };

    it('should create a new account', async () => {
      const userId = 'user-id';
      const mockAccount = {
        id: 'new-account-id',
        ...createAccountDto,
        userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.account.create.mockResolvedValue(mockAccount);

      const result = await service.create(createAccountDto, userId);

      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          ...createAccountDto,
          userId,
        },
      });
      expect(result).toEqual(mockAccount);
    });
  });

  describe('update', () => {
    const updateAccountDto: UpdateAccountDto = {
      name: 'Updated Account',
      balance: 1500,
      color: '#33FF57',
    };

    it('should update an existing account', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const existingAccount = {
        id: accountId,
        name: 'Old Account',
        type: 'checking',
        balance: 1000,
        userId,
        isActive: true,
      };
      const updatedAccount = {
        ...existingAccount,
        ...updateAccountDto,
        updatedAt: new Date(),
      };

      mockPrismaService.account.findUnique.mockResolvedValue(existingAccount);
      mockPrismaService.account.update.mockResolvedValue(updatedAccount);

      const result = await service.update(accountId, updateAccountDto, userId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: updateAccountDto,
      });
      expect(result).toEqual(updatedAccount);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      const userId = 'user-id';
      const accountId = 'non-existent-id';

      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(
        service.update(accountId, updateAccountDto, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if account does not belong to the user', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const existingAccount = {
        id: accountId,
        name: 'Old Account',
        type: 'checking',
        balance: 1000,
        userId: 'different-user-id',
        isActive: true,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(existingAccount);

      await expect(
        service.update(accountId, updateAccountDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an account if it belongs to the user and has no transactions', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const existingAccount = {
        id: accountId,
        name: 'Account to Delete',
        type: 'checking',
        balance: 0,
        userId,
        isActive: true,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(existingAccount);
      mockPrismaService.transaction.count.mockResolvedValue(0);
      mockPrismaService.account.delete.mockResolvedValue(existingAccount);

      const result = await service.remove(accountId, userId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { accountId },
      });
      expect(mockPrismaService.account.delete).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(result).toEqual({
        success: true,
        message: 'Account deleted successfully',
      });
    });

    it('should throw ForbiddenException if account has transactions', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const existingAccount = {
        id: accountId,
        name: 'Account with Transactions',
        type: 'checking',
        balance: 1000,
        userId,
        isActive: true,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(existingAccount);
      mockPrismaService.transaction.count.mockResolvedValue(5);

      await expect(service.remove(accountId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { accountId },
      });
      expect(mockPrismaService.account.delete).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should deactivate an account', async () => {
      const userId = 'user-id';
      const accountId = 'account-id';
      const existingAccount = {
        id: accountId,
        name: 'Active Account',
        type: 'checking',
        balance: 1000,
        userId,
        isActive: true,
      };
      const deactivatedAccount = {
        ...existingAccount,
        isActive: false,
        updatedAt: new Date(),
      };

      mockPrismaService.account.findUnique.mockResolvedValue(existingAccount);
      mockPrismaService.account.update.mockResolvedValue(deactivatedAccount);

      const result = await service.deactivate(accountId, userId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivatedAccount);
    });
  });
});
