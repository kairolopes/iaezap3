# Z-API WhatsApp Integration - Guia Rápido

## Em 5 Minutos

### 1. Obter Credenciais

1. Acesse https://z-api.io
2. Crie conta e conecte seu WhatsApp (escanear QR Code)
3. Copie suas credenciais:
   - **Instance ID**: `seu_instance_id`
   - **Token**: `seu_token`

### 2. Configurar Ambiente

Crie `.env.local`:
```bash
Z_API_INSTANCE_ID=seu_instance_id
Z_API_TOKEN=seu_token
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
APP_BASE_URL=http://localhost:3000
```

### 3. Instalar Dependências

```bash
npm install axios @nestjs/config
```

### 4. Copiar Arquivos

Os seguintes arquivos foram criados:

```
src/modules/whatsapp/
├── z-api.service.ts          # Serviço principal Z-API
├── whatsapp.controller.ts     # Controller com endpoints
├── whatsapp.module.ts         # Módulo NestJS
├── triage-router.service.ts   # Roteador para agente TRIAGE
├── dtos/
│   └── webhook.dto.ts         # DTOs das requisições
└── examples.http              # Exemplos de requisições
```

### 5. Registrar Webhook

```bash
curl -X POST http://localhost:3000/api/whatsapp/register-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "http://localhost:3000"}'
```

### 6. Testar

```bash
# Enviar mensagem
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "message": "Olá!"
  }'
```

---

## Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/whatsapp/webhook` | Receber mensagens do WhatsApp |
| POST | `/api/whatsapp/send/text` | Enviar mensagem de texto |
| POST | `/api/whatsapp/send/image` | Enviar imagem |
| POST | `/api/whatsapp/send/buttons` | Enviar mensagem com botões |
| POST | `/api/whatsapp/send/document` | Enviar documento |
| POST | `/api/whatsapp/register-webhook` | Registrar webhook |

---

## Exemplos

### Enviar Texto
```json
POST /api/whatsapp/send/text

{
  "phone": "5585987654321",
  "message": "Olá!"
}
```

### Enviar Imagem
```json
POST /api/whatsapp/send/image

{
  "phone": "5585987654321",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "caption": "Descrição"
}
```

### Enviar Botões
```json
POST /api/whatsapp/send/buttons

{
  "phone": "5585987654321",
  "message": "Escolha uma opção:",
  "buttons": [
    { "id": "1", "text": "Opção 1" },
    { "id": "2", "text": "Opção 2" }
  ]
}
```

---

## Fluxo de Dados

```
WhatsApp → Z-API → /api/whatsapp/webhook
                         ↓
                   getOrCreateConversation()
                         ↓
                   createMessage()
                         ↓
                   routeToTriageAgent()
                         ↓
                   Armazenar em Supabase
```

---

## Estrutura de Banco de Dados

### Tabela: conversations
- `id` (UUID) - Chave primária
- `phone` (TEXT) - Número do contato
- `source` (TEXT) - Sempre 'whatsapp'
- `status` (TEXT) - 'active' ou 'archived'
- `last_message_at` (TIMESTAMP) - Última mensagem
- `metadata` (JSONB) - Dados adicionais
- `created_at` (TIMESTAMP) - Data de criação

### Tabela: messages
- `id` (UUID) - Chave primária
- `conversation_id` (UUID) - Referência a conversations
- `role` (TEXT) - 'user' ou 'assistant'
- `content` (TEXT) - Conteúdo da mensagem
- `metadata` (JSONB) - Dados adicionais
- `created_at` (TIMESTAMP) - Data de criação

### Tabela: triage_queue (opcional)
- `id` (UUID) - Chave primária
- `conversation_id` (UUID) - Referência a conversations
- `phone` (TEXT) - Número
- `message_content` (TEXT) - Conteúdo
- `priority` (TEXT) - 'low', 'medium', 'high'
- `status` (TEXT) - 'pending', 'completed', 'failed'
- `created_at` (TIMESTAMP) - Data de criação

---

## Variáveis de Ambiente

```bash
# Obrigatórias
Z_API_INSTANCE_ID=xxx          # Painel Z-API > Credenciais
Z_API_TOKEN=xxx                # Painel Z-API > Credenciais
SUPABASE_URL=xxx               # Supabase > Configurações
SUPABASE_KEY=xxx               # Supabase > API Keys
APP_BASE_URL=http://localhost:3000

# Opcionais
NODE_ENV=development
PORT=3000
WEBHOOK_URL=http://localhost:3000/api/whatsapp/webhook
```

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| 401 Unauthorized | Verifique Z_API_TOKEN em .env.local |
| 404 Not Found | Verifique Z_API_INSTANCE_ID em .env.local |
| Webhook não recebe | Registre webhook novamente |
| Erro Supabase | Verifique SUPABASE_URL e SUPABASE_KEY |

---

## Próximos Passos

1. **Implementar Agente TRIAGE** - Processar mensagens na fila
2. **Adicionar Autenticação** - Proteger endpoints
3. **Configurar Rate Limiting** - Limitar requisições
4. **Implementar Retry Logic** - Reenvio automático
5. **Adicionar Logging** - Winston/Pino

---

## Arquivos de Referência

- **Documentação Completa**: `WHATSAPP_SETUP.md`
- **Checklist de Setup**: `WHATSAPP_CHECKLIST.md`
- **Exemplos HTTP**: `src/modules/whatsapp/examples.http`
- **Exemplo App Module**: `src/modules/whatsapp/app.module.example.ts`

---

## Referências

- [Z-API Documentação](https://developer.z-api.io/)
- [Z-API Suporte](contato@z-api.io)
- [Supabase Docs](https://supabase.com/docs)
- [NestJS Docs](https://docs.nestjs.com/)

---

## Status de Integração

✅ Service de envio/recebimento (Z-API)
✅ Controller com endpoints
✅ Integração com Supabase
✅ Roteador para TRIAGE
✅ Exemplos HTTP
✅ Documentação

---

**Última atualização**: 2024-01-15
**Versão**: 1.0.0
