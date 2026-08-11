# Instruções de Integração - Z-API WhatsApp com NestJS

## Passos de Integração

### Passo 1: Instalar Dependências

```bash
npm install
npm install axios @nestjs/config
npm install --save-dev @types/node
```

---

### Passo 2: Criar Arquivo Supabase Service

Se você ainda não tiver um `SupabaseService`, crie:

**Arquivo**: `src/modules/supabase/supabase.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
    }

    this.supabase = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
```

---

### Passo 3: Criar Supabase Module

Se você ainda não tiver um `SupabaseModule`, crie:

**Arquivo**: `src/modules/supabase/supabase.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

---

### Passo 4: Atualizar App Module

Abra `src/app.module.ts` e adicione:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local', // ou '.env'
    }),
    SupabaseModule,        // Importar ANTES do Whatsapp
    WhatsappModule,        // Importar DEPOIS do Supabase
    // ... outros módulos
  ],
})
export class AppModule {}
```

---

### Passo 5: Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

---

### Passo 6: Configurar .env.local

Crie arquivo `.env.local` na raiz do projeto:

```bash
# Z-API
Z_API_INSTANCE_ID=seu_instance_id_do_z_api
Z_API_TOKEN=seu_token_do_z_api

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica_supabase

# NestJS
NODE_ENV=development
PORT=3000

# Aplicação
APP_BASE_URL=http://localhost:3000
```

**Valores de Exemplo:**
- **Z_API Instance ID**: `INSTANCIA_123456789`
- **Z_API Token**: `TOKEN_abc123def456`
- **Supabase URL**: `https://myproject.supabase.co`
- **Supabase Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Passo 7: Criar Tabelas no Supabase

Acesse **SQL Editor** no painel Supabase e execute:

#### Criar Tabela: conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'telegram', 'other')),
  external_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_conversations_source ON conversations(source);
CREATE INDEX idx_conversations_status ON conversations(status);
```

#### Criar Tabela: messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  external_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

#### Criar Tabela: triage_queue

```sql
CREATE TABLE triage_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_triage_queue_status ON triage_queue(status);
CREATE INDEX idx_triage_queue_priority ON triage_queue(priority DESC);
CREATE INDEX idx_triage_queue_created_at ON triage_queue(created_at DESC);
```

---

### Passo 8: Adicionar ao .gitignore

Certifique-se de que `.env.local` está no `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production.local
```

---

### Passo 9: Testar Localmente

```bash
npm run start:dev
```

Você deve ver:

```
[NestFactory] Starting Nest application...
[InstanceLoader] SupabaseModule dependencies initialized
[InstanceLoader] WhatsappModule dependencies initialized
[NestApplication] Listening on port 3000
```

---

### Passo 10: Registrar Webhook

Com a aplicação rodando, registre o webhook:

```bash
curl -X POST http://localhost:3000/api/whatsapp/register-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "http://localhost:3000"}'
```

---

## Arquivos Criados

```
src/modules/whatsapp/
├── z-api.service.ts              # Serviço principal
├── whatsapp.controller.ts         # Controller
├── whatsapp.module.ts             # Módulo
├── triage-router.service.ts       # Roteador TRIAGE
├── dtos/
│   └── webhook.dto.ts             # Data Transfer Objects
├── examples.http                  # Exemplos HTTP
└── app.module.example.ts          # Exemplo de integração

src/modules/supabase/
├── supabase.service.ts            # Serviço Supabase
└── supabase.module.ts             # Módulo Supabase

.env.example                        # Template de variáveis

Documentação:
├── WHATSAPP_SETUP.md              # Setup completo
├── WHATSAPP_CHECKLIST.md          # Checklist passo-a-passo
├── WHATSAPP_QUICKSTART.md         # Guia rápido
└── INTEGRATION_INSTRUCTIONS.md    # Este arquivo
```

---

## Testando Endpoints

### 1. Enviar Mensagem de Texto

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Olá! Testando integração.",
    "delayMessage": 1000
  }'
```

**Resposta esperada:**
```json
{
  "id": "msg_123456789",
  "status": "QUEUED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Enviar Imagem

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/image \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "imageUrl": "https://via.placeholder.com/500",
    "caption": "Imagem de teste"
  }'
```

### 3. Enviar Mensagem com Botões

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/buttons \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Qual é sua dúvida?",
    "buttons": [
      {"id": "1", "text": "Fatura"},
      {"id": "2", "text": "Produto"},
      {"id": "3", "text": "Entrega"}
    ]
  }'
```

---

## Validar Integração

### Checklist

- [ ] Dependências instaladas: `npm install`
- [ ] `.env.local` criado com credenciais Z-API
- [ ] Supabase URL e Key configurados
- [ ] Tabelas criadas no Supabase
- [ ] `SupabaseModule` e `WhatsappModule` registrados em `app.module.ts`
- [ ] Aplicação rodando: `npm run start:dev`
- [ ] Webhook registrado via POST `/api/whatsapp/register-webhook`
- [ ] Mensagem de texto enviada com sucesso
- [ ] Dados salvos em Supabase (tabelas `conversations` e `messages`)

---

## Troubleshooting

### Erro: "SUPABASE_URL and SUPABASE_KEY must be defined"

**Solução:**
1. Verifique se `.env.local` existe
2. Verifique se `SUPABASE_URL` e `SUPABASE_KEY` estão corretos
3. Reinicie: `npm run start:dev`

### Erro: "401 - Unauthorized"

**Solução:**
1. Copie novamente `Z_API_TOKEN` do painel Z-API
2. Verifique `Z_API_INSTANCE_ID`
3. Reinicie a aplicação

### Erro: "Cannot find module '@supabase/supabase-js'"

**Solução:**
```bash
npm install @supabase/supabase-js
```

### Webhook não recebe mensagens

**Solução:**
1. Verifique se URL é pública (não localhost)
2. Execute POST `/api/whatsapp/register-webhook` novamente
3. Aguarde 2-3 minutos para sincronização
4. Verifique logs: `npm run start:dev`

---

## Próximos Passos

1. **Implementar Agente TRIAGE**
   - Criar worker que processa `triage_queue`
   - Integrar com seu AI/modelo

2. **Adicionar Autenticação**
   - Proteger endpoints públicos
   - JWT tokens ou similares

3. **Implementar Rate Limiting**
   - @nestjs/throttler ou similar
   - Proteger contra abuso

4. **Melhorar Observabilidade**
   - Winston/Pino para logs estruturados
   - DataDog/New Relic para monitoring

5. **Otimizações**
   - Bull Queue para processamento async
   - Redis para caching
   - Métricas Prometheus

---

## Referências Rápidas

| Recurso | URL |
|---------|-----|
| Z-API Docs | https://developer.z-api.io/ |
| Z-API Painel | https://z-api.io/central-do-desenvolvedor |
| Supabase Docs | https://supabase.com/docs |
| NestJS Docs | https://docs.nestjs.com/ |
| WhatsApp Business | https://www.whatsapp.com/business/api/ |

---

**Criado em**: 2024-01-15
**Versão**: 1.0.0
**Status**: ✅ Pronto para uso
