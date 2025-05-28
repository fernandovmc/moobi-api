import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '../../generated/prisma';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  async findAll(userId: string, type?: string): Promise<Category[]> {
    return this.prismaService.category.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.prismaService.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    return this.prismaService.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    // Verificar se a categoria existe e pertence ao usuário
    await this.findOne(id, userId);

    return this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    // Verificar se a categoria existe e pertence ao usuário
    await this.findOne(id, userId);

    // Verificar se há transações associadas
    const transactionCount = await this.prismaService.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      throw new ForbiddenException(
        'Cannot delete category with transactions. Delete the transactions first.',
      );
    }

    await this.prismaService.category.delete({
      where: { id },
    });

    return { success: true };
  }

  async createDefaultCategories(userId: string): Promise<{ count: number }> {
    const defaultCategories = [
      {
        name: 'Alimentação',
        type: 'expense',
        color: '#FF5733',
        icon: 'restaurant',
        isDefault: true,
      },
      {
        name: 'Transporte',
        type: 'expense',
        color: '#3399FF',
        icon: 'directions_car',
        isDefault: true,
      },
      {
        name: 'Moradia',
        type: 'expense',
        color: '#33FF99',
        icon: 'home',
        isDefault: true,
      },
      {
        name: 'Saúde',
        type: 'expense',
        color: '#FF33A6',
        icon: 'local_hospital',
        isDefault: true,
      },
      {
        name: 'Educação',
        type: 'expense',
        color: '#A233FF',
        icon: 'school',
        isDefault: true,
      },
      {
        name: 'Lazer',
        type: 'expense',
        color: '#FFBF33',
        icon: 'sports_esports',
        isDefault: true,
      },
      {
        name: 'Salário',
        type: 'income',
        color: '#33FF57',
        icon: 'attach_money',
        isDefault: true,
      },
      {
        name: 'Investimentos',
        type: 'income',
        color: '#336BFF',
        icon: 'trending_up',
        isDefault: true,
      },
      {
        name: 'Vendas',
        type: 'income',
        color: '#FF3333',
        icon: 'shopping_cart',
        isDefault: true,
      },
    ];

    let count = 0;
    for (const category of defaultCategories) {
      await this.prismaService.category.create({
        data: {
          ...category,
          userId,
        },
      });
      count++;
    }

    return { count };
  }
}
