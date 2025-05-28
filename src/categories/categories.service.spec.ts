import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      const userId = 'user-id';
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Groceries',
          type: 'expense',
          color: '#FF5733',
          icon: 'shopping_cart',
          userId,
        },
        {
          id: 'cat-2',
          name: 'Salary',
          type: 'income',
          color: '#33FF57',
          icon: 'attach_money',
          userId,
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(userId);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should filter categories by type if type is provided', async () => {
      const userId = 'user-id';
      const type = 'expense';
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Groceries',
          type: 'expense',
          color: '#FF5733',
          icon: 'shopping_cart',
          userId,
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(userId, type);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId, type },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID if it belongs to the user', async () => {
      const userId = 'user-id';
      const categoryId = 'cat-id';
      const mockCategory = {
        id: categoryId,
        name: 'Groceries',
        type: 'expense',
        color: '#FF5733',
        icon: 'shopping_cart',
        userId,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId, userId);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const userId = 'user-id';
      const categoryId = 'non-existent-id';

      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
    });
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'New Category',
      type: 'expense',
      color: '#FF5733',
      icon: 'new_icon',
    };

    it('should create a new category', async () => {
      const userId = 'user-id';
      const mockCategory = {
        id: 'new-cat-id',
        ...createCategoryDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto, userId);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          userId,
        },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Category',
      color: '#33FF57',
      icon: 'updated_icon',
    };

    it('should update an existing category', async () => {
      const userId = 'user-id';
      const categoryId = 'cat-id';
      const existingCategory = {
        id: categoryId,
        name: 'Old Category',
        type: 'expense',
        color: '#FF5733',
        icon: 'old_icon',
        userId,
      };
      const updatedCategory = {
        ...existingCategory,
        ...updateCategoryDto,
        updatedAt: new Date(),
      };

      mockPrismaService.category.findFirst.mockResolvedValue(existingCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(
        categoryId,
        updateCategoryDto,
        userId,
      );

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: updateCategoryDto,
      });
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const userId = 'user-id';
      const categoryId = 'non-existent-id';

      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(categoryId, updateCategoryDto, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category if it belongs to the user and has no transactions', async () => {
      const userId = 'user-id';
      const categoryId = 'cat-id';
      const existingCategory = {
        id: categoryId,
        name: 'Category to Delete',
        type: 'expense',
        color: '#FF5733',
        icon: 'delete_icon',
        userId,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(existingCategory);
      mockPrismaService.transaction.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue(existingCategory);

      const result = await service.remove(categoryId, userId);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { categoryId: categoryId },
      });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual({
        success: true,
      });
    });

    it('should throw ForbiddenException if category has transactions', async () => {
      const userId = 'user-id';
      const categoryId = 'cat-id';
      const existingCategory = {
        id: categoryId,
        name: 'Category with Transactions',
        type: 'expense',
        color: '#FF5733',
        icon: 'delete_icon',
        userId,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(existingCategory);
      mockPrismaService.transaction.count.mockResolvedValue(5);

      await expect(service.remove(categoryId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { categoryId: categoryId },
      });
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });
  });

  describe('createDefaultCategories', () => {
    it('should create default categories for a user', async () => {
      const userId = 'user-id';
      mockPrismaService.category.create.mockImplementation(() => {
        return Promise.resolve({});
      });

      const result = await service.createDefaultCategories(userId);

      expect(mockPrismaService.category.create).toHaveBeenCalledTimes(9);
      expect(result).toEqual({ count: 9 });
    });
  });
});
