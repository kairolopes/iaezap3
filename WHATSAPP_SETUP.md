# Z-API WhatsApp Integration - Guia de Setup

## Visão Geral

Esta documentação descreve como integrar Z-API WhatsApp em um projeto NestJS, incluindo:
- Recebimento de mensagens via webhooks
- Envio de mensagens (texto, imagem, documentos, botões)
- Armazenamento em Supabase
- Roteamento para agente TRIAGE

---

## 1. Obtenção de Credenciais Z-API

### Passo 1: Criar Conta

1. Acesse [z-api.io](https://z-api.io)
2. Clique em "Cadastre-se" ou "Sign Up"
3. Preencha email e senha
4. Confirme o email

### Passo 2: Conectar Número WhatsApp

1. Acesse o painel: https://z-api.io/central-do-desenvolvedor
2. Clique em "Conectar WhatsApp" ou "Connect Instance"
3. Escaneie o QR Code com o seu número WhatsApp
4. Confirme a conexão

### Passo 3: Obter Credenciais

Após conectar a instância:

1. Vá para **Credenciais** ou **API Credentials**
2. Você verá dois valores:
   - **Instance ID**: `seu_instance_id_aqui`
   - **Client Token**: `seu_token_aqui`

3. Copie os valores

---

## 2. Configurar Variáveis de Ambiente

### Arquivo `.env.local` (desenvolvimento)

```bash
# Z-API
Z_API_INSTANCE_ID=seu_instance_id_aqui
Z_API_TOKEN=seu_token_aqui
APP_BASE_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica_aqui

# NestJS
NODE_ENV=development
PORT=3000
```

### Variáveis Obrigatórias

| Variável | Descrição | Obtenção |
|----------|-----------|----------|
| `Z_API_INSTANCE_ID` | ID da instância WhatsApp | Painel Z-API > Credenciais |
| `Z_API_TOKEN` | Token de autenticação | Painel Z-API > Credenciais |
| `SUPABASE_URL` | URL do projeto Supabase | Supabase > Configurações |
| `SUPABASE_KEY` | Chave pública Supabase | Supabase > API Keys |
| `APP_BASE_URL` | URL base da aplicação | Configurar após deploy |

---

## 3. Estrutura de Banco de Dados (Supabase)

### Criar Tabelas

Execute os seguintes comandos no **SQL Editor** do Supabase:

#### Tabela: `conversations`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'whatsapp',
  external_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_conversations_source ON conversations(source);
```

#### Tabela: `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  external_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### Tabela: `triage_queue` (opcional, para processamento assíncrono)

```sql
CREATE TABLE triage_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_triage_queue_status ON triage_queue(status);
CREATE INDEX idx_triage_queue_priority ON triage_queue(priority);
```

---

## 4. Instalar Dependências

```bash
npm install
npm install axios @nestjs/config
```

---

## 5. Registrar Módulo no App

No seu `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    SupabaseModule,
    WhatsappModule,
    // outros módulos
  ],
})
export class AppModule {}
```

---

## 6. Registrar Webhook no Z-API

Após sua aplicação estar rodando, registre o webhook:

### Opção 1: Via Endpoint (Recomendado)

```bash
curl -X POST http://localhost:3000/api/whatsapp/register-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://seu-dominio.com"
  }'
```

### Opção 2: Painel Z-API

1. Acesse: https://z-api.io/central-do-desenvolvedor
2. Vá para **Webhooks** ou **Webhook Settings**
3. Configure:
   - **URL**: `https://seu-dominio.com/api/whatsapp/webhook`
   - **Eventos**: `messages.upsert`, `message.update`, `contacts.update`
4. Clique em **Salvar**

### Validação

O webhook está registrado corretamente quando:
- Mensagens recebidas criam registros em `conversations` e `messages`
- Nenhum erro 404 ou 401 aparece nos logs

---

## 7. Endpoints Disponíveis

### Receber Mensagens

```http
POST /api/whatsapp/webhook
Content-Type: application/json

{
  "type": "messages.upsert",
  "data": {
    "key": { "remoteJid": "5585987654321@s.whatsapp.net" },
    "message": { "conversation": "Olá!" },
    "messageTimestamp": "1705316400"
  }
}
```

**Resposta:**
```json
{ "status": "processed" }
```

---

### Enviar Mensagem de Texto

```http
POST /api/whatsapp/send/text
Content-Type: application/json

{
  "phone": "5585987654321",
  "message": "Olá! Como posso ajudar?",
  "delayMessage": 1000
}
```

**Resposta:**
```json
{
  "id": "msg_123456789",
  "status": "QUEUED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Enviar Imagem

```http
POST /api/whatsapp/send/image
Content-Type: application/json

{
  "phone": "5585987654321",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "caption": "Descrição da imagem"
}
```

---

### Enviar Mensagem com Botões

```http
POST /api/whatsapp/send/buttons
Content-Type: application/json

{
  "phone": "5585987654321",
  "message": "Escolha uma opção:",
  "buttons": [
    { "id": "btn_1", "text": "Opção 1" },
    { "id": "btn_2", "text": "Opção 2" },
    { "id": "btn_3", "text": "Opção 3" }
  ]
}
```

---

### Enviar Documento

```http
POST /api/whatsapp/send/document
Content-Type: application/json

{
  "phone": "5585987654321",
  "documentUrl": "https://exemplo.com/documento.pdf",
  "fileName": "documento.pdf",
  "caption": "Seu documento solicitado"
}
```

---

### Registrar Webhook

```http
POST /api/whatsapp/register-webhook
Content-Type: application/json

{
  "webhookUrl": "https://seu-dominio.com"
}
```

---

## 8. Fluxo de Processamento

```
WhatsApp → Z-API → Webhook (POST /api/whatsapp/webhook)
                        ↓
                   Validar payload
                        ↓
                   Extrair dados (phone, message)
                        ↓
                   getOrCreateConversation()
                        ↓
                   createMessage()
                        ↓
                   routeToTriageAgent()
                        ↓
                   Retornar { status: "processed" }
```

---

## 9. Rotas para Envio

```
API Application
    ↓
sendTextMessage() / sendImage() / etc.
    ↓
ZApiService.sendTextMessage()
    ↓
POST https://api.z-api.io/instances/{instanceId}/messages/text
    ↓
Z-API enfileira mensagem
    ↓
WhatsApp Web (conectado)
    ↓
WhatsApp do destinatário
```

---

## 10. Troubleshooting

### Erro: "401 - Unauthorized"

**Causa**: Token Z-API inválido

**Solução**:
1. Verifique `Z_API_TOKEN` em `.env.local`
2. Copie novamente do painel Z-API
3. Reinicie a aplicação: `npm run start:dev`

---

### Erro: "404 - Not Found"

**Causa**: Instance ID inválido

**Solução**:
1. Verifique `Z_API_INSTANCE_ID` em `.env.local`
2. Confirme que a instância está conectada em https://z-api.io
3. Copie novamente do painel

---

### Webhook não recebe mensagens

**Causa**: Webhook não registrado ou URL incorreta

**Solução**:
1. Verifique se a URL é acessível publicamente (não `localhost`)
2. Registre novamente via endpoint:
   ```bash
   POST /api/whatsapp/register-webhook
   ```
3. Teste manualmente:
   ```bash
   curl https://seu-dominio.com/api/whatsapp/webhook
   ```

---

### Erro ao conectar Supabase

**Causa**: Credenciais inválidas

**Solução**:
1. Verifique `SUPABASE_URL` e `SUPABASE_KEY` em `.env.local`
2. Obtenha novos valores em **Supabase → Configurações → API**
3. Reinicie: `npm run start:dev`

---

## 11. Exemplo Completo de Uso

### 1. Enviar mensagem via API

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Olá! Como você está?"
  }'
```

### 2. Receber resposta automática

O webhook processa automaticamente mensagens recebidas:
- Cria/atualiza conversa em `conversations`
- Insere mensagem em `messages`
- Roteia para TRIAGE

### 3. Consultar conversa

```sql
SELECT * FROM conversations WHERE phone = '5585987654321';
SELECT * FROM messages WHERE conversation_id = 'xxx' ORDER BY created_at;
```

---

## 12. Próximos Passos

1. **Implementar Agente TRIAGE**: Processar mensagens na fila
2. **Adicionar Autenticação**: Proteger endpoints
3. **Logs Estruturados**: Winston/Pino para melhor rastreamento
4. **Rate Limiting**: Proteção contra abuso
5. **Retry Logic**: Reenvio automático de mensagens falhadas
6. **Encryption**: Criptografar tokens em `.env`

---

## Referências

- [Z-API Documentação](https://developer.z-api.io/)
- [Supabase Docs](https://supabase.com/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [WhatsApp Business API](https://www.whatsapp.com/business/api/)
