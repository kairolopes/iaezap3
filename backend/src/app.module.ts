import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AgentModule } from './agent/agent.module';
import { ConversationModule } from './conversation/conversation.module';
import { PrismaModule } from './prisma/prisma.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    SupabaseModule,
    HealthModule,
    AuthModule,
    AgentModule,
    ConversationModule,
    WhatsappModule,
  ],
})
export class AppModule {}
