import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserResponse } from '../users/interfaces/user.interface';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase configuration. Please check your environment variables.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Método para validar token do usuário
  async validateUser(token: string): Promise<UserResponse> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      return data;
    } catch (error) {
      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}
