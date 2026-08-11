# Z-API WhatsApp Integration - Checklist de Setup

## Pré-Requisitos

- [ ] Conta Z-API criada em https://z-api.io
- [ ] Número WhatsApp conectado ao Z-API
- [ ] Projeto Supabase criado em https://supabase.com
- [ ] NestJS v9+ instalado
- [ ] Node.js v16+ instalado

---

## Fase 1: Obter Credenciais

- [ ] **Z-API**
  - [ ] Acessar https://z-api.io/central-do-desenvolvedor
  - [ ] Conectar instância WhatsApp (escanear QR Code)
  - [ ] Copiar Instance ID
  - [ ] Copiar Client Token (não compartilhar!)
  
- [ ] **Supabase**
  - [ ] Criar novo projeto em https://supabase.com
  - [ ] Copiar Project URL
  - [ ] Copiar Anon Key (ou Service Key)

---

## Fase 2: Configuração Local

- [ ] Criar arquivo `.env.local` com:
  ```
  Z_API_INSTANCE_ID=xxx
  Z_API_TOKEN=xxx
  SUPABASE_URL=xxx
  SUPABASE_KEY=xxx
  APP_BASE_URL=http://localhost:3000
  ```

- [ ] Nunca commitar `.env.local` no Git
- [ ] Adicionar `.env.local` ao `.gitignore`

---

## Fase 3: Banco de Dados

- [ ] No Supabase, acessar **SQL Editor**
- [ ] Executar script para criar tabela `conversations`:
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL DEFAULT 'whatsapp',
    external_id TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    last_message_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Executar script para criar tabela `messages`:
  ```sql
  CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    external_id TEXT UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Executar script para criar tabela `triage_queue`:
  ```sql
  CREATE TABLE triage_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    phone TEXT NOT NULL,
    message_content TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
  );
  ```

- [ ] Criar índices para performance:
  ```sql
  CREATE INDEX idx_conversations_phone ON conversations(phone);
  CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
  CREATE INDEX idx_triage_queue_status ON triage_queue(status);
  ```

---

## Fase 4: Instalar Dependências

```bash
npm install
npm install axios @nestjs/config
npm install --save-dev @types/node
```

- [ ] Verificar `package.json` tem:
  - [ ] `axios`
  - [ ] `@nestjs/config`
  - [ ] `@nestjs/common`
  - [ ] `@nestjs/core`

---

## Fase 5: Estrutura de Arquivos

Verificar se os seguintes arquivos foram criados:

- [ ] `src/modules/whatsapp/z-api.service.ts` - Serviço principal
- [ ] `src/modules/whatsapp/whatsapp.controller.ts` - Controller
- [ ] `src/modules/whatsapp/whatsapp.module.ts` - Módulo
- [ ] `src/modules/whatsapp/triage-router.service.ts` - Roteador TRIAGE
- [ ] `src/modules/whatsapp/dtos/webhook.dto.ts` - DTOs
- [ ] `src/modules/whatsapp/examples.http` - Exemplos de requisições

---

## Fase 6: Integrar Módulo

- [ ] Abrir `src/app.module.ts`
- [ ] Adicionar imports:
  ```typescript
  import { ConfigModule } from '@nestjs/config';
  import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
  ```

- [ ] Registrar no array `imports`:
  ```typescript
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    WhatsappModule,
  ]
  ```

- [ ] Verificar se `SupabaseService` está disponível e registrado

---

## Fase 7: Testar Localmente

```bash
npm run start:dev
```

- [ ] Verificar que não há erros de compilação
- [ ] Verificar log: "✓ Listening on port 3000"
- [ ] Testar endpoint de saúde:
  ```bash
  curl http://localhost:3000
  ```

---

## Fase 8: Registrar Webhook

Opção A: Via Endpoint
```bash
curl -X POST http://localhost:3000/api/whatsapp/register-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "http://localhost:3000"}'
```

Opção B: Painel Z-API
- [ ] Acessar https://z-api.io/central-do-desenvolvedor
- [ ] Ir para **Webhooks**
- [ ] Adicionar URL: `http://localhost:3000/api/whatsapp/webhook`
- [ ] Selecionar eventos: `messages.upsert`, `message.update`
- [ ] Salvar

---

## Fase 9: Testes Funcionais

### Teste 1: Enviar Mensagem
```bash
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Teste"
  }'
```

- [ ] Recebeu resposta com `"id"` e `"status": "QUEUED"`
- [ ] Mensagem apareceu no WhatsApp

### Teste 2: Receber Mensagem
- [ ] Enviar mensagem via WhatsApp para o número conectado
- [ ] Verificar no Supabase:
  - [ ] Apareceu em `conversations`
  - [ ] Apareceu em `messages`
  - [ ] `role = 'user'`

### Teste 3: Enviar Imagem
```bash
curl -X POST http://localhost:3000/api/whatsapp/send/image \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "imageUrl": "https://via.placeholder.com/500",
    "caption": "Teste"
  }'
```

- [ ] Recebeu resposta com sucesso
- [ ] Imagem apareceu no WhatsApp

### Teste 4: Enviar com Botões
```bash
curl -X POST http://localhost:3000/api/whatsapp/send/buttons \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Escolha:",
    "buttons": [
      {"id": "1", "text": "Opção 1"},
      {"id": "2", "text": "Opção 2"}
    ]
  }'
```

- [ ] Recebeu resposta com sucesso
- [ ] Mensagem com botões apareceu no WhatsApp

---

## Fase 10: Deploy

### Preparar para Produção

- [ ] Variáveis de ambiente em produção:
  - [ ] `Z_API_INSTANCE_ID` (obter do Z-API)
  - [ ] `Z_API_TOKEN` (obter do Z-API)
  - [ ] `SUPABASE_URL` (obter do Supabase)
  - [ ] `SUPABASE_KEY` (obter do Supabase)
  - [ ] `APP_BASE_URL` = URL pública da aplicação

- [ ] Registrar novo webhook com URL pública:
  ```bash
  POST /api/whatsapp/register-webhook
  {
    "webhookUrl": "https://seu-dominio.com"
  }
  ```

- [ ] Testar webhook no painel Z-API

---

## Fase 11: Monitoramento

- [ ] Configurar logs estruturados (Winston/Pino)
- [ ] Verificar logs regularmente:
  ```bash
  # Via Heroku
  heroku logs -f
  
  # Via Railway
  railway logs
  ```

- [ ] Monitorar erros Z-API no painel

---

## Fase 12: Otimizações (Opcional)

- [ ] [ ] Implementar fila de mensagens (Bull Queue, RabbitMQ)
- [ ] [ ] Rate limiting nos endpoints
- [ ] [ ] Retry logic para mensagens falhadas
- [ ] [ ] Criptografar tokens em banco de dados
- [ ] [ ] Implementar autenticação nos endpoints
- [ ] [ ] Adicionar testes unitários
- [ ] [ ] Documentar API com Swagger/OpenAPI

---

## Troubleshooting

### "401 Unauthorized"
- [ ] Verificar `Z_API_TOKEN` em `.env.local`
- [ ] Copiar novamente do painel Z-API
- [ ] Reiniciar: `npm run start:dev`

### "404 Not Found"
- [ ] Verificar `Z_API_INSTANCE_ID` em `.env.local`
- [ ] Confirmar instância está conectada em https://z-api.io
- [ ] Reiniciar aplicação

### "Webhook não recebe mensagens"
- [ ] Verificar se URL é pública (não `localhost`)
- [ ] Acessar `https://seu-dominio.com/api/whatsapp/webhook`
- [ ] Registrar webhook novamente
- [ ] Verificar logs da aplicação

### "Erro ao conectar Supabase"
- [ ] Verificar `SUPABASE_URL` e `SUPABASE_KEY`
- [ ] Testar conexão diretamente no Supabase Studio
- [ ] Verificar regras RLS se habilitadas

---

## Próximos Passos Após Setup

1. **Implementar Agente TRIAGE**
   - [ ] Criar serviço que processa `triage_queue`
   - [ ] Integrar com seu AI model
   - [ ] Enviar respostas automáticas

2. **Adicionar Persistência**
   - [ ] Salvar histórico de conversas
   - [ ] Implementar busca por conversa

3. **Melhorar UX**
   - [ ] Adicionar typing indicator
   - [ ] Suportar mídias mais complexas
   - [ ] Implementar menu persistente

4. **Escalabilidade**
   - [ ] Implementar Bull Queue para processamento async
   - [ ] Caching com Redis
   - [ ] Métricas e monitoramento

---

## Contato e Suporte

- **Z-API Suporte**: contato@z-api.io (24/7 em português)
- **Documentação**: https://developer.z-api.io/
- **Playground**: https://z-api.io/swagger
- **Issues**: Seu repositório do GitHub

---

**Status**: [ ] Todos os itens completados
**Data de Conclusão**: _______________
**Responsável**: _______________
