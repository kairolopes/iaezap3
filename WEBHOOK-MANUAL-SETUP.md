# ⚠️ WEBHOOK SETUP - MANUAL (100% SEGURO)

## 🔴 Situação Atual

```
❌ Webhook não está registrado
❌ Nenhuma mensagem sendo recebida
❌ Backend pronto para receber
```

## 🚀 Como Configurar Manualmente (SEGURO)

### PASSO 1: Acessa Z-API Dashboard
```
https://app.z-api.io
```

### PASSO 2: Reconecta a Instância (se bloqueada)
```
1. Clica em sua instância "ieaezap"
2. Clica em "Reconectar" ou "Reautenticar"
3. Escaneia o QR code
4. Aguarda sincronizar (30 segundos)
5. Status deve ficar "CONNECTED" (verde)
```

### PASSO 3: Registra Webhook (MANUAL - SEM API CALLS)
```
1. Clica na aba "Webhooks e configurações gerais"
2. Procura por "Webhook URL" ou "Registrar Webhook"
3. Cola exatamente isso:
   http://localhost:3000/api/whatsapp/webhook

4. Escolhe os eventos:
   ✅ Mensagens recebidas
   ✅ Confirmação de entrega (opcional)
   ✅ Mensagens lidas (opcional)

5. Clica em "Salvar" ou "Registrar"
```

### PASSO 4: Verifica se Funcionou
```bash
# Rodas o script de verificação
node check-messages.js

# Se recebeu mensagem, mostra:
✅ Total de conversas: 1
✅ Total de mensagens: 1
📱 Mensagens recebidas: 1
```

---

## ⚠️ NÃO FAÇA ISSO

```javascript
// ❌ NUNCA chame via API
POST /api/whatsapp/register-webhook

// ❌ NUNCA POST para /webhook automaticamente
POST /instances/{id}/token/{token}/webhook

// ❌ NUNCA tente /reconnect
POST /instances/{id}/token/{token}/reconnect
```

---

## 🛡️ Proteção Ativa

```
✅ Backend bloqueará essas chamadas
✅ Será retornado: "BLOQUEADO - Registre manualmente"
✅ Nenhum bloqueio será causado
```

---

## 📋 Checklist

- [ ] 1. Acesso Z-API Dashboard
- [ ] 2. Instância está "CONNECTED"
- [ ] 3. Aba "Webhooks e configurações gerais"
- [ ] 4. Webhook URL: `http://localhost:3000/api/whatsapp/webhook`
- [ ] 5. Eventos selecionados: "Mensagens recebidas"
- [ ] 6. Clicou em "Salvar"
- [ ] 7. Aguardou 10 segundos
- [ ] 8. Enviou mensagem para o número
- [ ] 9. Rodou: `node check-messages.js`
- [ ] 10. Apareceu a mensagem no banco ✅

---

## 🆘 Se Ainda Não Funcionar

### Opção 1: Webhook URL Incorreta?
```
Verifique:
- Digitou certo: http://localhost:3000/api/whatsapp/webhook
- Seu servidor está rodando? npm run start:dev
- Porta 3000 está aberta?
```

### Opção 2: Número Bloqueado Novamente?
```
1. Reconecta novamente no Z-API
2. Aguarda sincronizar (1 minuto completo)
3. Envia outra mensagem
```

### Opção 3: Debug Detalhado
```bash
# Ver últimas conversas
curl http://localhost:3000/api/whatsapp/debug/conversations

# Ver últimas mensagens
curl http://localhost:3000/api/whatsapp/debug/messages/latest

# Ver mensagens recebidas
curl http://localhost:3000/api/whatsapp/debug/messages/incoming
```

---

## ✅ Quando Funcionar

Você verá:
```
✅ Mensagem recebida no webhook
✅ Conversation criada no Supabase
✅ Message salva no banco
✅ TRIAGE agent roteado
✅ Resposta enviada automaticamente
```

---

**Importante:** Este setup é **100% manual e seguro**. Nenhuma chamada automática será feita! 🔒
