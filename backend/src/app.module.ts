import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AgentModule } from './agent/agent.module';
import { ConversationModule } from './conversation/conversation.module';
import { ZApiModule } from './z-api/z-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    AgentModule,
    ConversationModule,
    ZApiModule,
  ],
})
export class AppModule {}
