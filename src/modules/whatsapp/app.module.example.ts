/**
 * EXEMPLO DE APP.MODULE.TS COM WHATSAPP INTEGRADO
 *
 * Copie as linhas relevantes para seu app.module.ts
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ============================================
// IMPORTAÇÕES DO WHATSAPP
// ============================================
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

// ============================================
// OUTROS MÓDULOS (exemplo)
// ============================================
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    /**
     * ConfigModule: Carrega variáveis de ambiente
     * Deve ser importado como global para ser usado em toda a aplicação
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local', // Arquivo de configuração local (não commitar)
      // envFilePath: ['.env.local', '.env'], // Para múltiplos arquivos
      // expandVariables: true, // Para variáveis recursivas
    }),

    /**
     * Supabase: Banco de dados e autenticação
     * Deve ser importado antes do Whatsapp pois o WhatsappModule depende dele
     */
    SupabaseModule,

    /**
     * Whatsapp: Integração Z-API
     * Fornece endpoints para enviar/receber mensagens WhatsApp
     */
    WhatsappModule,

    /**
     * Outros módulos da aplicação
     */
    AuthModule,
    UsersModule,
    // ... adicione mais módulos conforme necessário
  ],
  // Decoradores opcionais
  controllers: [],
  providers: [],
})
export class AppModule {}

/**
 * ============================================
 * ESTRUTURA DE DIRETÓRIOS RECOMENDADA
 * ============================================
 *
 * src/
 * ├── modules/
 * │   ├── whatsapp/
 * │   │   ├── z-api.service.ts
 * │   │   ├── whatsapp.controller.ts
 * │   │   ├── whatsapp.module.ts
 * │   │   ├── triage-router.service.ts
 * │   │   ├── dtos/
 * │   │   │   └── webhook.dto.ts
 * │   │   └── examples.http
 * │   ├── supabase/
 * │   │   ├── supabase.service.ts
 * │   │   └── supabase.module.ts
 * │   ├── auth/
 * │   │   └── ... outros arquivos
 * │   └── users/
 * │       └── ... outros arquivos
 * ├── app.module.ts
 * ├── main.ts
 * └── ...
 */

/**
 * ============================================
 * EXEMPLO MÍNIMO DO SUPABASE SERVICE
 * ============================================
 *
 * Crie arquivo: src/modules/supabase/supabase.service.ts
 */

/*
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    this.supabase = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
*/

/**
 * ============================================
 * EXEMPLO MÍNIMO DO SUPABASE MODULE
 * ============================================
 *
 * Crie arquivo: src/modules/supabase/supabase.module.ts
 */

/*
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
*/

/**
 * ============================================
 * INSTRUÇÕES DE INTEGRAÇÃO
 * ============================================
 *
 * 1. Copie este arquivo para seu app.module.ts
 *
 * 2. Certifique-se de que `SupabaseModule` está importado ANTES de `WhatsappModule`
 *
 * 3. Crie arquivo `.env.local` com:
 *    Z_API_INSTANCE_ID=seu_instance_id
 *    Z_API_TOKEN=seu_token
 *    SUPABASE_URL=sua_url
 *    SUPABASE_KEY=sua_chave
 *    APP_BASE_URL=http://localhost:3000
 *
 * 4. Execute: npm run start:dev
 *
 * 5. Endpoints disponíveis:
 *    - POST /api/whatsapp/webhook (receber mensagens)
 *    - POST /api/whatsapp/send/text (enviar texto)
 *    - POST /api/whatsapp/send/image (enviar imagem)
 *    - POST /api/whatsapp/send/buttons (enviar botões)
 *    - POST /api/whatsapp/send/document (enviar documento)
 *    - POST /api/whatsapp/register-webhook (registrar webhook)
 *
 * 6. Verifique logs em: npm run start:dev
 */
