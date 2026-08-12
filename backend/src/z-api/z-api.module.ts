import { Module } from '@nestjs/common';
import { ZApiService } from './z-api.service';
import { ZApiController } from './z-api.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [SupabaseModule, ConversationModule],
  providers: [ZApiService],
  controllers: [ZApiController],
  exports: [ZApiService],
})
export class ZApiModule {}
