# 🤖 IAEZAP - AI WhatsApp Business Platform

Sistema multi-tenant de IA para gerenciar chatbots inteligentes no WhatsApp Business.

## 🚀 Quick Start

### 1. Clone and setup
```bash
cd iaezap3
# Já está clonado!

# Copy .env
cp backend/.env.example backend/.env
```

### 2. Run with Docker
```bash
docker-compose up -d
```

Aguarde ~30 segundos para o banco ser criado.

### 3. Acesse
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Banco de dados**: postgresql://localhost:5432/iaezap_dev

### 4. Login (Temporário - sem hash no dev)
```
Email: kairo@zapbaratinho.com.br
Senha: 123456
```

## 📁 Estrutura

```
iaezap3/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Login, JWT
│   │   ├── company/     # Multi-tenant
│   │   ├── agent/       # Multi-agentes
│   │   ├── conversation/# WhatsApp chats
│   │   └── prisma/      # Database
│   └── prisma/schema.prisma
├── frontend/            # React app
│   └── src/
│       ├── pages/
│       ├── store/       # Zustand state
│       └── services/
└── docker-compose.yml
```

## 🔧 Próximos Passos

### Fase 1: Setup & Auth ✅ (FEITO)
- [x] NestJS + Prisma scaffold
- [x] PostgreSQL + Redis
- [x] JWT authentication
- [x] React + TypeScript frontend
- [ ] Seed initial data (master user + test company)

### Fase 2: Multi-Agent Core (NEXT)
- [ ] Create agents via API
- [ ] Route conversations to agents
- [ ] Message persistence
- [ ] WebSocket for real-time

### Fase 3: WhatsApp Integration
- [ ] Webhook receiver
- [ ] Send/receive messages
- [ ] Media handling
- [ ] Phone number management

### Fase 4: AI Response Generation
- [ ] OpenAI integration
- [ ] Agent personality prompt building
- [ ] Knowledge base retrieval
- [ ] Response confidence scoring

## 📊 Database Schema

### Core Entities:
- **User** - Login, roles (MASTER, OWNER, ADMIN, AGENT, VIEWER)
- **Company** - Multi-tenant isolation, owned by User
- **Agent** - Multiple AI agents per company (TRIAGE, SALES, SCHEDULING, SUPPORT)
- **Conversation** - WhatsApp chat, routed to Agent
- **Message** - Individual messages in conversation
- **Document** - Knowledge base for agents

## 🔐 Security Notes

- JWT authentication with refresh tokens
- Multi-tenant isolation via companyId
- Role-based access control (RBAC)
- Passwords must be hashed before saving
- Use .env for secrets

## 📝 API Endpoints (To Implement)

```
POST   /auth/register
POST   /auth/login
POST   /companies
GET    /companies
POST   /agents/:companyId
GET    /agents/:companyId
POST   /conversations/:companyId
GET    /conversations/:companyId
POST   /conversations/:id/messages
PATCH  /conversations/:id/status
```

## 🐛 Development

### Watch logs:
```bash
docker-compose logs -f backend
```

### Reset database:
```bash
docker-compose down -v
docker-compose up -d
```

### Database UI:
```bash
docker exec iaezap3-backend-1 npx prisma studio
```

## 👤 Master Admin (Você)
- Cria empresas
- Cria usuários e assign a empresas
- Gerencia configurações globais
- Email: kairo@zapbaratinho.com.br

## 🎯 MVP Goals
1. ✅ Auth & multi-tenant
2. ✅ Multi-agent system
3. ⏳ WhatsApp integration
4. ⏳ Message routing
5. ⏳ AI responses

---

**Total scope**: 9-14 meses (MVP → Produção)  
**Current phase**: Infrastructure setup (Week 1)  
**Next target**: Agents CRUD + Message routing (Week 2-3)
