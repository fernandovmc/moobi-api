import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
      },
    }),
    validateUser: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockSupabaseService.getClient().auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            email: registerDto.email,
          },
          session: {},
        },
        error: null,
      });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
      });

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockSupabaseService.getClient().auth.signUp).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            name: registerDto.name,
          },
        },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user-id',
          email: registerDto.email,
          name: registerDto.name,
        },
      });
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(
        mockSupabaseService.getClient().auth.signUp,
      ).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should login a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
      });
      mockSupabaseService
        .getClient()
        .auth.signInWithPassword.mockResolvedValue({
          data: {
            user: {
              id: 'user-id',
              email: loginDto.email,
            },
            session: {},
          },
          error: null,
        });

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(
        mockSupabaseService.getClient().auth.signInWithPassword,
      ).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(
        mockSupabaseService.getClient().auth.signInWithPassword,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if Supabase returns an error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
      });
      mockSupabaseService
        .getClient()
        .auth.signInWithPassword.mockResolvedValue({
          data: {},
          error: { message: 'Invalid credentials' },
        });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(
        mockSupabaseService.getClient().auth.signInWithPassword,
      ).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      const userId = 'user-id';
      mockSupabaseService.validateUser.mockResolvedValue({
        user: { id: userId },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        _count: {
          accounts: 2,
          categories: 5,
          transactions: 10,
        },
      });

      const result = await service.getCurrentUser('valid-token');

      expect(mockSupabaseService.validateUser).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
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
      expect(result.user).toBeDefined();
    });

    it('should throw NotFoundException if user not found in database', async () => {
      const userId = 'user-id';
      mockSupabaseService.validateUser.mockResolvedValue({
        user: { id: userId },
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentUser('valid-token')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSupabaseService.validateUser).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
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
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockSupabaseService.getClient().auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await service.logout();

      expect(mockSupabaseService.getClient().auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should throw error if Supabase returns an error', async () => {
      const error = new Error('Sign out error');
      mockSupabaseService.getClient().auth.signOut.mockResolvedValue({
        error,
      });

      await expect(service.logout()).rejects.toThrow(error);
      expect(mockSupabaseService.getClient().auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
