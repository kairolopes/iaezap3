import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZApiService } from './z-api.service';
import { WhatsappController } from './whatsapp.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [ZApiService],
  controllers: [WhatsappController],
  exports: [ZApiService],
})
export class WhatsappModule {}
