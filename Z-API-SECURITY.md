# 🔒 Z-API Security & Protection Guide

## ⚠️ O Que Causou o Bloqueio

Quando fiz a chamada automática para registrar webhook via API:
```
POST /instances/{id}/token/{token}/webhook
```

Isso disparou uma **reconexão automática** que bloqueou o número.

---

## 🛡️ Sistema de Proteção Implementado

### Endpoints Perigosos (BLOQUEADOS)
```
❌ /webhook           - Causa reconexão
❌ /reconnect         - Desconecta o número
❌ /disconnect        - Desativa a instância
❌ /qr                - Requer novo scan QR
❌ /status            - Pode trigger reconexão
```

### Endpoints Seguros (PERMITIDOS)
```
✅ /send-text        - Enviar mensagem
✅ /send-image       - Enviar imagem
✅ /send-document    - Enviar arquivo
✅ /send-buttons     - Enviar botões
```

---

## 📋 Validações de Segurança

### 1. Rate Limiting
```
Máximo: 10 chamadas/minuto
Se exceder: Bloqueada por 1 minuto
```

### 2. Detecção de Risco
```
safe      → Permitido
warning   → Log com aviso
dangerous → BLOQUEADO
```

### 3. Auditoria Completa
```
- Todas as chamadas são registradas
- Histórico de 1 hora mantido
- Endpoint para verificar status
```

---

## 🚀 Como Usar Corretamente

### ✅ CORRETO - Webhook Manual
```
1. Acessa Z-API Dashboard
2. Clica em "Webhooks e configurações"
3. Cola a URL manualmente:
   http://localhost:3000/api/whatsapp/webhook
4. Escolhe eventos: "Mensagens recebidas"
5. Salva
```

### ❌ ERRADO - Webhook via API
```
// NÃO FAÇA ISSO!
POST /api/whatsapp/register-webhook

// Será BLOQUEADO automaticamente
```

---

## 📊 Monitorar Proteção

### Verificar Status
```bash
curl http://localhost:3000/api/whatsapp/protection/status
```

### Resposta
```json
{
  "service": "Z-API Protection",
  "history": {
    "totalCalls": 5,
    "byRisk": {
      "safe": 5,
      "warning": 0,
      "dangerous": 0
    }
  },
  "recommendations": [
    "✅ Nunca chame /webhook automaticamente",
    "✅ Nunca chame /reconnect via API",
    "✅ Registre webhook apenas 1 vez, manualmente",
    "✅ Envie mensagens com rate limit (máx 10/minuto)",
    "✅ Monitore logs para bloqueios",
    "✅ Se bloqueado, reconecte manualmente no dashboard"
  ]
}
```

---

## 🔧 Se o Número Foi Bloqueado

### 1. Reconecte Manualmente
```
Dashboard Z-API → Instância → "Reconectar"
Escaneia QR code novamente
```

### 2. Aguarde Sincronização (30 segundos)
```
Status deve mudar de "DISCONNECTED" para "CONNECTED"
```

### 3. Teste Envio
```bash
node test-z-api-direct.js
```

---

## 📝 Regras de Ouro

| Regra | Motivo | Violação |
|-------|--------|----------|
| Nunca chame `/webhook` via API | Causa reconexão | 🚫 Bloqueio |
| Nunca chame `/reconnect` | Desconecta | 🚫 Bloqueio |
| Máx 10 msgs/minuto | Rate limit | ⚠️ Lentidão |
| Registre webhook 1 vez | Evita conflitos | ⚠️ Duplicação |
| Monitore logs | Detecção cedo | ✅ Prevenção |

---

## 🎯 Próximos Passos

### Fase 1: Desbloquear (Você faz)
1. Acessa Z-API Dashboard
2. Reconecta a instância
3. Testa novamente

### Fase 2: Configurar (Você faz)
1. Registra webhook manualmente
2. Escolhe eventos
3. Salva

### Fase 3: Testar (Backend automático)
1. Envia mensagem: `POST /api/whatsapp/send/text`
2. Webhook recebe: `POST /api/whatsapp/webhook`
3. Responde automaticamente

---

## ✅ Checklist de Segurança

- [ ] Webhook registrado MANUALMENTE no dashboard
- [ ] Proteção ativa no backend (GET /protection/status)
- [ ] Número reconectado e sincronizado
- [ ] Testes de envio funcionando
- [ ] Rate limiting em produção (máx 5 msgs/seg)
- [ ] Logs sendo monitorados
- [ ] Equipe consciente dos riscos

---

**Status:** ✅ Proteção implementada e ativa contra bloqueios futuros!
