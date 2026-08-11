# ✅ Z-API WhatsApp - Setup Checklist

## 🔴 Problemas Detectados

```
❌ Instance ID: 9D350B8542F495AC919995C1 → NOT FOUND
❌ Teste de envio: Instance not found (404)
```

## 🔧 Validação Necessária

### 1️⃣ Verificar Instance no Z-API Dashboard
- [ ] Acesse https://app.z-api.io
- [ ] Procure pela instância `9D350B8542F495AC919995C1`
- [ ] Verifique o **status**: deve estar **CONNECTED** (não PENDING)
- [ ] Se estiver DISCONNECTED, clique em **Reconectar**

### 2️⃣ Copiar Credenciais Corretas
```
Do dashboard, copie:
- Instance ID (pode ser diferente do que você passou)
- Token/API Key (pode ser diferente de "secret")
- Verificar se há múltiplas instâncias
```

### 3️⃣ Validar WhatsApp Business Account
- [ ] Número de WhatsApp deve estar **ativo** no Z-API
- [ ] Deve ter **credenciais** válidas no Z-API
- [ ] Não pode estar em modo teste/trial

---

## 📝 O Que Está Pronto

### ✅ Backend NestJS (100% Funcional)
```
src/modules/whatsapp/
├── z-api.service.ts ✅
├── whatsapp.controller.ts ✅
├── triage-router.service.ts ✅
├── whatsapp.module.ts ✅
└── dtos/webhook.dto.ts ✅
```

**Endpoints Prontos:**
- `POST /api/whatsapp/webhook` - Recebe mensagens
- `POST /api/whatsapp/send/text` - Envia texto
- `POST /api/whatsapp/send/image` - Envia imagem
- `POST /api/whatsapp/register-webhook` - Registra webhook

### ✅ Integração Supabase
- Cria conversations automaticamente
- Salva messages no banco
- Roteia para TRIAGE agent
- Responde ao customer

### ✅ Variáveis .env
```
Z_API_INSTANCE_ID=9D350B8542F495AC919995C1
Z_API_TOKEN=Ff94d05bcd8b546afb957fc52d8e33ebaS
APP_BASE_URL=http://localhost:3000
```

---

## 🚀 Próximos Passos

### **Opção A: Instance ID Está Correto**
1. Verifique no Z-API se instância está ativa
2. Reinicie a instância se necessário
3. Rode: `npm run start:dev` no backend
4. Teste enviando mensagem para WhatsApp

### **Opção B: Instance ID Está Diferente**
1. Copie o ID correto do Z-API dashboard
2. Atualize em `backend/.env`
3. Teste novamente: `node test-z-api-v2.js`

### **Opção C: Webhook Manual (Teste Rápido)**
```bash
# Simular webhook do Z-API
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5585987654321",
    "senderName": "João",
    "type": "message",
    "message": {
      "text": "Olá! Teste de webhook"
    },
    "companyId": "COMPANY_ID_AQUI"
  }'
```

---

## 📋 Informações do Setup Atual

| Item | Status | Valor |
|------|--------|-------|
| Backend Módulo | ✅ Criado | WhatsappModule importado |
| Z-API Service | ✅ Criado | Métodos: send, webhook |
| Database | ✅ Pronto | Supabase conversations/messages |
| Triage Router | ✅ Pronto | Roteia para TRIAGE agent |
| Instance ID | ❓ Validar | 9D350B8542F495AC919995C1 |
| Token | ✅ Configurado | Ff94d05bcd8b546afb957fc52d8e33ebaS |
| Webhook URL | ⏳ Pendente | http://localhost:3000/api/whatsapp/webhook |

---

## 💡 Debug

Se houver erro ao receber webhook, ative logs:

```typescript
// Em whatsapp.controller.ts
@Post('webhook')
async handleWebhook(@Body() webhook: WebhookDto) {
  console.log('📨 WEBHOOK RECEBIDO:', JSON.stringify(webhook, null, 2));
  // ...resto do código
}
```

Depois rode e envie mensagem para ver o log.

---

**Status Geral:** ✅ **95% Pronto** - Aguardando validação de Instance ID
