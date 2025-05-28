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
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { Request } from 'express';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Req() request: Request, @Query('type') type?: string) {
    const userId = request['user'].id;
    return { categories: await this.categoriesService.findAll(userId, type) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].id;
    return { category: await this.categoriesService.findOne(id, userId) };
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() request: Request) {
    const userId = request['user'].id;
    return { 
      category: await this.categoriesService.create(createCategoryDto, userId),
      message: 'Category created successfully'
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].id;
    return { 
      category: await this.categoriesService.update(id, updateCategoryDto, userId),
      message: 'Category updated successfully'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].id;
    return this.categoriesService.remove(id, userId);
  }

  @Post('default')
  async createDefaults(@Req() request: Request) {
    const userId = request['user'].id;
    const result = await this.categoriesService.createDefaultCategories(userId);
    return {
      message: `${result.count} default categories created successfully`,
      count: result.count
    };
  }
} 