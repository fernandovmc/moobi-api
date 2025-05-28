import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseService } from './supabase/supabase.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule, PrismaModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
