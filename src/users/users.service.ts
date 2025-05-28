import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponse } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(
    private supabaseService: SupabaseService,
    private prismaService: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = registerDto;

    // Verificar se o usuário já existe no Prisma
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Registrar no Supabase
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });

    if (error) {
      throw error;
    }

    // Criar usuário no Prisma
    if (data.user) {
      await this.prismaService.user.create({
        data: {
          id: data.user.id,
          email: data.user.email,
          name: name || null,
        },
      });
    }

    return { data, error };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Verificar se o usuário existe no Prisma
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Login no Supabase
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { data, error };
  }

  async getCurrentUser(token: string) {
    const supabaseData = await this.supabaseService.validateUser(token);
    
    if (supabaseData.user) {
      const user = await this.prismaService.user.findUnique({
        where: { id: supabaseData.user.id },
        include: {
          _count: {
            select: {
              accounts: true,
              categories: true,
              transactions: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found in database');
      }

      return {
        user: {
          ...user,
          password: undefined,
        },
      };
    }

    return supabaseData;
  }

  async logout() {
    const { error } = await this.supabaseService.getClient().auth.signOut();

    if (error) {
      throw error;
    }

    return { success: true };
  }

  // Métodos adicionais para gerenciar usuários no Prisma

  async getAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    // Verificar se o usuário existe
    await this.getUserById(id);

    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    // Verificar se o usuário existe
    await this.getUserById(id);

    // Excluir do Prisma (as relações serão excluídas em cascata)
    await this.prismaService.user.delete({
      where: { id },
    });

    // Tentar excluir do Supabase também
    try {
      // Isso precisará de autenticação administrativa
      await this.supabaseService.getClient().auth.admin.deleteUser(id);
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
      // Continuamos mesmo se falhar no Supabase
    }

    return { success: true };
  }
}
