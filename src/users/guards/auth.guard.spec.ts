import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockSupabaseService.validateUser.mockResolvedValue({
        user: { id: 'user-id', email: 'test@example.com' },
      });

      const result = await guard.canActivate(mockContext);

      expect(mockSupabaseService.validateUser).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: 'user-id',
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockRequest = {
        headers: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockSupabaseService.validateUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockSupabaseService.validateUser.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockSupabaseService.validateUser).toHaveBeenCalledWith(
        'invalid-token',
      );
    });

    it('should throw UnauthorizedException when token format is incorrect', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockSupabaseService.validateUser).not.toHaveBeenCalled();
    });
  });
});
