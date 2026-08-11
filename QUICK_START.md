# 🚀 IAEZAP - Quick Start (5 minutos)

## Estrutura Completa Pronta!

✅ **Backend**: NestJS + Prisma + PostgreSQL  
✅ **Frontend**: React + TypeScript + Zustand  
✅ **Docker**: Docker Compose (tudo containerizado)  
✅ **Database**: Schema multi-tenant completo  
✅ **Auth**: JWT + Roles (MASTER, OWNER, ADMIN...)  
✅ **Multi-Agents**: Sistema pronto para agentes de IA  

---

## Como Começar

### 1. Clone o repositório
```bash
git clone https://github.com/kairolopes/iaezap3.git
cd iaezap3
```

### 2. Inicie com Docker (uma única linha!)
```bash
docker-compose up -d
```

Isso vai:
- Criar banco PostgreSQL
- Criar Redis cache
- Iniciar API NestJS (porta 3000)
- Iniciar Frontend React (porta 5173)

### 3. Aguarde ~30 segundos

```bash
# Ver logs se desejar:
docker-compose logs -f backend
```

### 4. Acesse

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:3000 |
| **Banco de dados** | localhost:5432/iaezap_dev |

---

## Primeiro Login

**Email**: kairo@zapbaratinho.com.br  
**Senha**: 123456  

(Provisório no dev - vai ser criado via seed na próxima fase)

---

## Estrutura do Projeto

```
iaezap3/
├── backend/
│   ├── src/
│   │   ├── auth/              ← Login & JWT
│   │   ├── company/           ← Multi-tenant
│   │   ├── agent/             ← Agentes de IA (TRIAGE, SALES, SCHEDULING, SUPPORT)
│   │   ├── conversation/      ← WhatsApp chats
│   │   ├── prisma/            ← Database connection
│   │   └── main.ts
│   └── prisma/schema.prisma   ← Database schema
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── store/auth.ts      ← State management
│   │   └── main.tsx
│   └── index.html
│
└── docker-compose.yml         ← Tudo containerizado
```

---

## Próximos Passos (O que fazer a partir daqui)

### Phase 1: Database Seed ✨ (PRÓXIMO)
```bash
# Criar master user automaticamente
npm run db:seed  # (vamos criar isso)
```

### Phase 2: Agent CRUD ✨
- [ ] Criar agente via UI
- [ ] Editar agente
- [ ] Listar agentes
- [ ] Deletar agente

### Phase 3: Message Routing ✨
- [ ] Receber mensagem do WhatsApp
- [ ] Rotear para agent correto (TRIAGE primeiro)
- [ ] Salvar conversa no banco
- [ ] Enviar resposta

### Phase 4: AI Integration ✨
- [ ] Chamar OpenAI/Anthropic
- [ ] Usar knowledge base como context
- [ ] Gerar resposta
- [ ] Enviar via WhatsApp

---

## Comandos Úteis

### Backend
```bash
# Entrar no container
docker exec -it iaezap3-backend-1 sh

# Ver logs
docker-compose logs -f backend

# Prisma Studio (UI para banco)
docker exec iaezap3-backend-1 npx prisma studio

# Resetar banco
docker-compose down -v && docker-compose up -d
```

### Frontend
```bash
# Logs
docker-compose logs -f frontend

# Rebuild
docker-compose up -d --build frontend
```

---

## Estrutura de Dados (Schema)

### User
- id, email, password, name, role
- Roles: MASTER (você), OWNER, ADMIN, AGENT, VIEWER

### Company
- id, name, businessName, cnpj, timezone
- Isolamento multi-tenant

### Agent (Multi-Agent System!) 
- id, name, role (TRIAGE|SALES|SCHEDULING|SUPPORT)
- personality, tone, language
- autonomy settings (canRespond24h, canCreateOrder, canSchedule)

### Conversation
- id, customerName, customerPhone
- agent (roteamento)
- status (OPEN|IN_PROGRESS|RESOLVED|ESCALATED)
- messages (histórico)

### Message
- id, text, sender (CUSTOMER|AI|HUMAN)
- isFromAI, confidence, modelUsed

### Document (Knowledge Base)
- title, type (PDF|SPREADSHEET|FAQ|LINK|TEXT)
- content (indexado para busca)

---

## API Endpoints (To Use)

```
POST   /auth/register          - Criar usuário
POST   /auth/login             - Login
POST   /companies              - Criar empresa
GET    /companies              - Listar minhas empresas
GET    /companies/:id          - Detalhe empresa

POST   /agents/:companyId      - Criar agente
GET    /agents/:companyId      - Listar agentes
GET    /agents/detail/:id      - Detalhe agente
PUT    /agents/:id             - Editar agente

POST   /conversations/:companyId     - Criar conversa
GET    /conversations/:companyId     - Listar conversas
GET    /conversations/detail/:id     - Detalhe conversa
POST   /conversations/:id/messages   - Adicionar mensagem
PATCH  /conversations/:id/status     - Atualizar status
```

---

## Stack Tecnológico

| Parte | Tech |
|-------|------|
| **Backend** | NestJS + Node.js + TypeScript |
| **Frontend** | React 18 + Vite + TypeScript |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **Cache** | Redis |
| **Auth** | JWT + Passport |
| **State** | Zustand |
| **Design** | Nocturne (dark mode) |
| **Containerization** | Docker + Docker Compose |

---

## Conta Master (Você)

**Você é o MASTER**:
- ✅ Criar empresas
- ✅ Criar usuários
- ✅ Assign usuários a empresas
- ✅ Gerenciar tudo

**Email**: kairo@zapbaratinho.com.br

---

## Próximo Commit: Seed Database

```bash
# Criar arquivo de seed
# Colocar master user e empresa de teste
# Fazer npm run db:seed automaticamente

# Depois: Agent CRUD completo
# Depois: WhatsApp webhook receiver
# Depois: AI response generation
```

---

## Status do Projeto

📅 **Fase 1: Infrastructure** ✅ COMPLETO
- Docker Compose pronto
- Database schema pronto
- Auth module pronto
- Basic frontend pronto

📅 **Fase 2: Multi-Agent Core** ⏳ COMEÇANDO
- Agent CRUD (prox)
- Message routing
- Conversation management

📅 **Fase 3: WhatsApp Integration** ⏳ PRÓXIMO
- Webhook receiver
- Send/receive messages

📅 **Fase 4: AI Integration** ⏳ DEPOIS
- OpenAI/Anthropic
- Knowledge base retrieval

📅 **Fase 5: Production** ⏳ FUTURO
- Deployment
- Monitoring
- Scaling

---

## 🎯 MVP Completo em ~4 semanas

**Week 1** ✅ Infrastructure  
**Week 2** Agent CRUD + Message routing  
**Week 3** WhatsApp integration  
**Week 4** AI responses  

Após isso, temos um MVP funcional!

---

**Repository**: https://github.com/kairolopes/iaezap3  
**Commits**: Vamos adicionar 1 feature a cada dia  
**Próximo**: Agent CRUD + Database seed
