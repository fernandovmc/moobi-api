import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccountsController],
  providers: [AccountsService, SupabaseService],
  exports: [AccountsService],
})
export class AccountsModule {}
