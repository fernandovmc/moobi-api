import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthResponse } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = registerDto;

    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          name: registerDto.name || '',
        },
      },
    });

    if (error) {
      throw error;
    }

    return { data, error };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

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
    return this.supabaseService.validateUser(token);
  }

  async logout() {
    const { error } = await this.supabaseService.getClient().auth.signOut();

    if (error) {
      throw error;
    }

    return { success: true };
  }
}
