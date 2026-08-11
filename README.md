# 🤖 IAEZAP - AI WhatsApp Business Platform

Sistema multi-tenant de IA para gerenciar chatbots inteligentes no WhatsApp Business.

Built with: **NestJS** + **React** + **Supabase** (PostgreSQL + Auth + Realtime)

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Setup Supabase
Veja **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** para:
- Criar projeto no Supabase
- Executar SQL schema
- Copiar credenciais

### 2️⃣ Configure .env
```bash
cp backend/.env.example backend/.env
# Preencher SUPABASE_URL e keys
```

### 3️⃣ Start Backend + Frontend
```bash
# Terminal 1: Backend
cd backend && npm install && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

**Acesso**:
- 🌐 Frontend: http://localhost:5173
- 🔌 API: http://localhost:3000

---

## 📁 Estrutura

```
iaezap3/
├── backend/
│   ├── src/
│   │   ├── supabase/        ← Supabase wrapper
│   │   ├── agent/           ← Agent CRUD
│   │   ├── conversation/    ← Messages
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           ← Login, Dashboard
│   │   ├── store/           ← Zustand auth
│   │   └── main.tsx
│   └── package.json
└── SUPABASE_SETUP.md        ← Setup instructions
```

---

## 🎯 Features Ready

✅ **Multi-Tenant** - Isolamento por company_id  
✅ **Multi-Agent** - 4 tipos: TRIAGE, SALES, SCHEDULING, SUPPORT  
✅ **Conversations** - WhatsApp chat routing  
✅ **Auth** - Supabase Auth integrado  
✅ **API** - Agent CRUD + Message management  

---

## 📊 Database Schema

- **Profiles** - Users extended with roles
- **Companies** - Multi-tenant containers
- **Agents** - AI agents com personality
- **Conversations** - WhatsApp chats
- **Messages** - Chat history
- **Documents** - Knowledge base
- **WhatsApp Numbers** - Integration tokens

---

## 🔌 API Endpoints

```
POST   /agents/:companyId      - Criar agente
GET    /agents/:companyId      - Listar agentes
PUT    /agents/:id             - Editar agente
DELETE /agents/:id             - Deletar agente

POST   /conversations/:companyId      - Criar conversa
GET    /conversations/:companyId      - Listar conversas
POST   /conversations/:id/messages    - Add mensagem
PATCH  /conversations/:id/status      - Update status
```

---

## 🚦 Development Phases

| Phase | Status | Timeline |
|-------|--------|----------|
| **1. Infrastructure** | ✅ Done | Week 1 |
| **2. Agent CRUD UI** | ⏳ Next | Week 2 |
| **3. WhatsApp Webhook** | ⏳ Soon | Week 3 |
| **4. AI Integration** | ⏳ Later | Week 4 |

---

## 👤 Master Account

Email: `kairo@zapbaratinho.com.br`  
Role: `MASTER` - Cria empresas e usuários

---

## 📚 Full Setup Guide

👉 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete step-by-step guide

---

**Repository**: https://github.com/kairolopes/iaezap3
