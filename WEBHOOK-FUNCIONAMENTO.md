# ✅ Webhook - Como Funciona

## 📝 Endpoint

```
POST http://localhost:3000/api/whatsapp/webhook
```

---

## 🔄 Fluxo Completo

```
Z-API (envia mensagem)
    ↓
POST /api/whatsapp/webhook
    ↓
1. getOrCreateConversation()
   ├─ Procura conversation existente por phone
   ├─ Se não achar, cria nova
   ├─ Usa company padrão se não informada
   └─ Retorna: conversation.id
    ↓
2. saveMessage()
   ├─ Insere mensagem no banco
   ├─ Campo: conversation_id
   ├─ Campo: sender = 'CUSTOMER'
   ├─ Campo: text = mensagem do usuário
   └─ Retorna: message.id
    ↓
3. routeToTriageAgent()
   ├─ Encontra agente TRIAGE da company
   ├─ Atribui agente à conversation
   ├─ Gera resposta automática
   └─ Retorna: texto da resposta
    ↓
4. sendText()
   ├─ Envia resposta via Z-API
   ├─ De volta para o número
   └─ Usa zApiService.sendText()
    ↓
✅ Webhook completo
```

---

## 📊 Formato do Webhook (Esperado)

Z-API envia algo assim:

```json
{
  "phone": "5562985635204",
  "senderName": "João",
  "type": "message",
  "message": {
    "text": "Olá, como posso ajudar?"
  }
}
```

---

## ✅ O Que é Salvo no Supabase

### Tabela: conversations
```
id           | customer_phone    | customer_name | company_id | status | agent_id
abc123       | 5562985635204     | João          | xyz789     | OPEN   | agent_id
```

### Tabela: messages
```
id           | conversation_id | text                      | sender   | is_from_ai | created_at
msg123       | abc123          | "Olá, como posso ajudar?" | CUSTOMER | false      | 2026-08-11
msg124       | abc123          | "Olá João, eu sou..."     | AI       | true       | 2026-08-11
```

---

## 🛡️ Proteções Implementadas

✅ **Validação de phone** - Rejeita sem número  
✅ **Company padrão** - Usa primeira company se não informada  
✅ **Error handling** - Captura e registra erros  
✅ **Logging completo** - Console mostra cada passo  
✅ **Rate limiting** - Protection service monitora chamadas

---

## 🧪 Como Testar

### 1. Antes de tudo
```bash
# Rode o seed
node run-seed.js

# Rode o backend
cd backend && npm run start:dev
```

### 2. Registre webhook no Z-API Dashboard
```
URL: http://localhost:3000/api/whatsapp/webhook
Eventos: Mensagens recebidas
Salvar
```

### 3. Envie mensagem para o número
```
Envie uma mensagem normal do WhatsApp
```

### 4. Verifique se gravou
```bash
node check-messages.js
```

Deve mostrar:
```
✅ Total de conversas: 1
✅ Total de mensagens: 1
📱 Mensagens recebidas: 1
```

---

## 📋 Response do Webhook

**Sucesso:**
```json
{
  "status": "success",
  "conversationId": "abc123def456",
  "messageId": "msg789xyz",
  "responseStatus": "sent"
}
```

**Erro:**
```json
{
  "status": "error",
  "error": "Nenhuma company configurada"
}
```

---

## 🔍 Logs no Backend

Quando mensagem chega:
```
📨 Webhook recebido: {
  "phone": "5562985635204",
  "message": "Olá",
  "type": "message"
}
✅ Conversation: abc123def456
✅ Message: msg789xyz
✅ Response gerada: Olá João...
✅ Resposta enviada
```

---

## ⚠️ Se Não Funcionar

### Webhook não chega
```
1. Verificar se registrado: Z-API Dashboard → Webhooks
2. Verificar se URL está correta
3. Backend está rodando? (npm run start:dev)
4. Porta 3000 aberta?
```

### Message não grava
```
1. Verificar logs do backend
2. Supabase está conectado?
3. Tabela conversations existe?
```

### Resposta não é enviada
```
1. Z-API está conectada?
2. Número não está bloqueado?
3. Verificar logs de erro
```

---

## 📱 Resumo

| Etapa | O que faz | Onde salva |
|-------|-----------|-----------|
| 1 | Recebe webhook | Log |
| 2 | Cria/encontra conversation | Supabase conversations |
| 3 | Salva mensagem | Supabase messages |
| 4 | Roteia para TRIAGE | Supabase agents |
| 5 | Gera resposta | Em memória |
| 6 | Envia de volta | Z-API → WhatsApp |

**Tudo funciona! Só precisa registrar o webhook no Z-API dashboard.** 🚀
