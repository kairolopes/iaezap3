# IAEZAP - Plano de Engenharia de Software

## 1. VISÃO GERAL DO PROJETO

**Objetivo:** Transformar IAEZAP de mockup em plataforma SaaS produção

**Funcionalidade Principal:** Painel inteligente para gerenciar chatbots de IA no WhatsApp Business API

**Usuários-alvo:** Pequenos negócios (floricultura, varejo, serviços)

---

## 2. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Web)                           │
│  React/TypeScript + Nocturne Design System                   │
│  - Dashboard, WhatsApp, Catálogo, Agendamentos, Pagamentos  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   API   │
                    │ RESTful │
                    │ GraphQL │
                    └────┬────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼─────┐         ┌────▼─────┐        ┌────▼──────┐
│ Auth    │         │ Business │        │ WhatsApp  │
│ Service │         │ Logic    │        │ Integration
│         │         │ Service  │        │           │
└───┬─────┘         └────┬─────┘        └────┬──────┘
    │                    │                    │
    │              ┌─────▼──────┐             │
    │              │  Database  │             │
    │              │ PostgreSQL │             │
    │              └────────────┘             │
    │                                         │
    └────────────────────┬────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
      ┌────▼────┐  ┌─────▼────┐  ┌────▼────┐
      │ Queue   │  │ Storage  │  │External │
      │ Redis   │  │   S3     │  │ APIs    │
      │         │  │          │  │Stripe,WA│
      └─────────┘  └──────────┘  └─────────┘
```

---

## 3. STACK TECNOLÓGICO

### Frontend
- **Framework:** React 18+ com TypeScript
- **State Management:** Redux Toolkit / Zustand
- **Styling:** CSS Modules + Nocturne Design System
- **Build:** Vite / Webpack
- **Testing:** Vitest, React Testing Library
- **Icons:** Phosphor Icons

### Backend
- **Runtime:** Node.js 18+
- **Framework:** NestJS / Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma / TypeORM
- **API:** REST + GraphQL (Apollo)
- **Validation:** Zod / Joi
- **Testing:** Jest, Supertest

### Banco de Dados
- **Primary:** PostgreSQL 14+
  - Users, Companies, AI Agents
  - Products, Schedules, Conversations
  - Payments, Analytics
- **Cache:** Redis
  - Session storage
  - Rate limiting
  - Real-time counters
- **Search:** Elasticsearch (opcional, para KB)

### Infraestrutura
- **Hosting:** AWS / Google Cloud / DigitalOcean
- **Container:** Docker + Docker Compose
- **Orquestração:** Kubernetes (escala)
- **CI/CD:** GitHub Actions / GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack / CloudWatch

### Integrações
- **WhatsApp:** WhatsApp Business API
- **Pagamentos:** Stripe / Pix gateway
- **Email:** SendGrid / AWS SES
- **Storage:** AWS S3 / Google Cloud Storage
- **IA:** OpenAI API / Anthropic API

---

## 4. COMPONENTES PRINCIPAIS

### 4.1 Authentication & Authorization
```typescript
// Services needed:
- AuthService (JWT, OAuth2)
- RoleBasedAccessControl (RBAC)
- MFAService (2FA)
- SessionManagement
```

### 4.2 Company Management
```
Company
├── Settings
├── Team Members
├── Billing Info
├── WhatsApp Numbers
└── AI Agents (max 4)
```

### 4.3 AI Agent Engine
```
Agent
├── Personality (Name, Tone, Language)
├── Instructions (House rules)
├── Knowledge Base (Documents, FAQs)
├── Autonomy Settings (What can do alone)
├── Routing Rules
└── Performance Analytics
```

### 4.4 WhatsApp Integration
```
WhatsAppService
├── connectNumber() - WhatsApp Business API
├── receiveMessage() - Webhook handler
├── sendMessage() - Send via API
├── updateStatus() - Track delivery
└── handleMedia() - Process images/docs
```

### 4.5 Conversation Management
```
Conversation
├── Customer Info
├── Messages History
├── Agent Interaction
├── Status (Open/Resolved/Escalated)
├── Tags/Labels
└── Metadata (duration, resolution time)
```

### 4.6 Knowledge Base
```
Document
├── Title, Type (PDF, Link, Spreadsheet)
├── Content (indexed for search)
├── Usage Analytics (how often IA uses it)
├── Update history
└── Relevance score
```

### 4.7 Product Catalog
```
Product
├── Name, Description
├── Price, Stock
├── Category
├── IA Visibility (on/off)
├── Tags
└── Sales Analytics
```

### 4.8 Scheduling System
```
Schedule
├── Availability Rules (hours, days, radius)
├── Delivery Slots
├── Bookings
├── Reminders
└── Capacity Management
```

### 4.9 Payment Processing
```
Payment
├── Order ID
├── Amount, Currency
├── Method (Pix, Card, Boleto)
├── Status (Pending, Paid, Failed)
├── Webhook integration
└── Receipt generation
```

### 4.10 Analytics & Reporting
```
Analytics
├── Conversations (count, resolution rate)
├── AI Performance (accuracy, resolution %)
├── Revenue (by product, customer)
├── Response Time
└── Custom Reports
```

---

## 5. DATA MODELS (Prisma Schema)

```prisma
// User & Auth
model User {
  id String @id @default(cuid())
  email String @unique
  password String
  name String
  role Role // OWNER, ADMIN, AGENT, VIEWER
  company Company @relation(fields: [companyId], references: [id])
  companyId String
  createdAt DateTime @default(now())
}

// Company
model Company {
  id String @id @default(cuid())
  name String
  businessName String
  cnpj String @unique
  address String
  timezone String
  whatsappNumbers WhatsAppNumber[]
  agents AIAgent[]
  products Product[]
  conversations Conversation[]
  documents Document[]
  users User[]
}

// WhatsApp Integration
model WhatsAppNumber {
  id String @id @default(cuid())
  phoneNumber String @unique
  status "CONNECTED" | "DISCONNECTED"
  company Company @relation(fields: [companyId], references: [id])
  companyId String
  lastSync DateTime
}

// AI Agents
model AIAgent {
  id String @id @default(cuid())
  name String
  role "TRIAGE" | "SALES" | "SCHEDULING" | "SUPPORT"
  personality Personality
  instructions String
  autonomySettings AutonomySettings
  knowledgeBase Document[]
  conversations Conversation[]
  analytics AgentAnalytics
  company Company @relation(fields: [companyId], references: [id])
  companyId String
}

// Conversations
model Conversation {
  id String @id @default(cuid())
  customerId String
  customerName String
  customerPhone String
  messages Message[]
  agent AIAgent @relation(fields: [agentId], references: [id])
  agentId String
  status "OPEN" | "RESOLVED" | "ESCALATED"
  assignedTo User? // Human agent if escalated
  metadata Json
  company Company @relation(fields: [companyId], references: [id])
  companyId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Message {
  id String @id @default(cuid())
  conversation Conversation @relation(fields: [conversationId], references: [id])
  conversationId String
  text String
  sender "CUSTOMER" | "AI" | "HUMAN"
  metadata Json
  timestamp DateTime @default(now())
}

// Products
model Product {
  id String @id @default(cuid())
  name String
  description String
  price Float
  stock Int
  category String
  visibleToAI Boolean @default(true)
  sales Int @default(0)
  company Company @relation(fields: [companyId], references: [id])
  companyId String
}

// Knowledge Base
model Document {
  id String @id @default(cuid())
  title String
  type "PDF" | "SPREADSHEET" | "FAQ" | "LINK" | "TEXT"
  content String
  usage Int @default(0)
  agent AIAgent @relation(fields: [agentId], references: [id])
  agentId String
  company Company @relation(fields: [companyId], references: [id])
  companyId String
  updatedAt DateTime @updatedAt
}

// Schedules
model Schedule {
  id String @id @default(cuid())
  date DateTime
  startTime String
  endTime String
  capacity Int
  booked Int @default(0)
  company Company @relation(fields: [companyId], references: [id])
  companyId String
}

// Payments
model Payment {
  id String @id @default(cuid())
  orderId String
  amount Float
  currency String @default("BRL")
  method "PIX" | "CARD" | "BOLETO" | "LINK"
  status "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  externalId String? // Stripe/Pix reference
  company Company @relation(fields: [companyId], references: [id])
  companyId String
  createdAt DateTime @default(now())
}
```

---

## 6. API ENDPOINTS

### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/2fa-verify
```

### Company
```
GET    /companies/:id
PATCH  /companies/:id
GET    /companies/:id/settings
PATCH  /companies/:id/settings
```

### AI Agents
```
GET    /agents
POST   /agents
GET    /agents/:id
PATCH  /agents/:id
DELETE /agents/:id
GET    /agents/:id/analytics
POST   /agents/:id/publish
```

### Conversations
```
GET    /conversations
GET    /conversations/:id
GET    /conversations/:id/messages
POST   /conversations/:id/messages
PATCH  /conversations/:id (status, assignee)
```

### WhatsApp
```
POST   /whatsapp/connect
GET    /whatsapp/numbers
DELETE /whatsapp/numbers/:id
POST   /whatsapp/webhook (receive messages)
```

### Products
```
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

### Knowledge Base
```
GET    /documents
POST   /documents (upload)
DELETE /documents/:id
POST   /documents/search (semantic search)
```

### Payments
```
POST   /payments
GET    /payments/:id
GET    /payments/company/:companyId
POST   /payments/webhook (Stripe/Pix)
```

### Analytics
```
GET    /analytics/dashboard
GET    /analytics/conversations
GET    /analytics/agents/:agentId
GET    /analytics/revenue
GET    /analytics/ai-performance
```

---

## 7. FLUXO DE MENSAGENS (Real-time)

```
1. Customer sends message via WhatsApp
2. WhatsApp webhook → Backend API
3. Create Conversation + Message record
4. Route to appropriate AI Agent
5. AI Agent processes (calls OpenAI/Anthropic)
6. Response stored in DB
7. Send message back via WhatsApp API
8. Update Conversation status
9. WebSocket emit to company dashboard
10. Analytics updated
```

---

## 8. SEGURANÇA

### Authentication
- [x] JWT tokens (access + refresh)
- [x] HTTPS/TLS everywhere
- [x] 2FA optional

### Authorization
- [x] RBAC (Role-Based Access Control)
- [x] Company isolation (multi-tenant)
- [x] API rate limiting

### Data Protection
- [x] Encryption at rest (DB, S3)
- [x] Encryption in transit
- [x] PII anonymization in logs
- [x] GDPR/LGPD compliance
- [x] Secrets management (Vault/env)

### API Security
- [x] CORS configuration
- [x] CSRF tokens
- [x] Input validation
- [x] SQL injection prevention (ORM)
- [x] XSS protection

---

## 9. TESTING STRATEGY

### Unit Tests (80% coverage)
- Services
- Utils
- Validators

### Integration Tests (60% coverage)
- API endpoints
- Database operations
- External service mocks

### E2E Tests (50% coverage)
- User flows
- Payment processing
- WhatsApp integration

### Performance Tests
- Load testing (k6)
- Database query optimization
- Cache hit rates

---

## 10. DEPLOYMENT STRATEGY

### Environments
```
Development  → Localhost + Docker Compose
Staging      → AWS/GCP + full test suite
Production   → Auto-scaling + monitoring
```

### CI/CD Pipeline
```
1. Push to GitHub
2. Run tests (unit, integration, e2e)
3. Code coverage check
4. Build Docker image
5. Push to registry
6. Deploy to staging
7. Smoke tests
8. Manual approval
9. Deploy to production
10. Monitor metrics
```

### Database Migrations
- Prisma migrations (version controlled)
- Zero-downtime deployments
- Rollback capability

---

## 11. ROADMAP (Fases)

### Fase 1: MVP (2-3 meses)
- [x] Core authentication
- [x] Company & user management
- [x] WhatsApp number connection
- [x] Basic message routing
- [x] Simple dashboard
- [x] Product catalog CRUD

### Fase 2: AI Intelligence (2-3 meses)
- [x] Multiple AI agents
- [x] Agent personality customization
- [x] Knowledge base integration
- [x] AI response generation (OpenAI)
- [x] Conversation management
- [x] Basic analytics

### Fase 3: Commerce (1-2 meses)
- [x] Payment integration (Stripe/Pix)
- [x] Order tracking
- [x] Inventory management
- [x] Revenue analytics

### Fase 4: Advanced Features (2-3 meses)
- [x] Scheduling system with calendar
- [x] Automated workflows
- [x] Team collaboration tools
- [x] Custom reports
- [x] API for partners

### Fase 5: Scale & Optimize (Ongoing)
- [x] Performance optimization
- [x] Advanced analytics/ML
- [x] Mobile app
- [x] More integrations

---

## 12. MÉTRICAS DE SUCESSO

**Technical KPIs:**
- API response time < 200ms (p99)
- Uptime > 99.9%
- Error rate < 0.1%
- Database query time < 50ms

**Business KPIs:**
- User acquisition & retention
- Conversation resolution rate
- AI accuracy improvement
- Revenue per customer
- NPS score > 50

---

## 13. ESTRUTURA DE PASTAS

```
iaezap/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── agents/
│   │   ├── conversations/
│   │   ├── whatsapp/
│   │   ├── products/
│   │   ├── documents/
│   │   ├── payments/
│   │   ├── analytics/
│   │   ├── common/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── public/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## 14. PRÓXIMOS PASSOS

1. **Setup inicial**
   - [ ] Criar repositórios backend/frontend
   - [ ] Configurar Docker Compose local
   - [ ] Setup CI/CD pipeline

2. **Database design**
   - [ ] Finalize Prisma schema
   - [ ] Create migrations
   - [ ] Setup test database

3. **Backend scaffold**
   - [ ] NestJS setup
   - [ ] Auth module
   - [ ] Database connection

4. **Frontend scaffold**
   - [ ] React + TypeScript setup
   - [ ] Nocturne DS integration
   - [ ] Component library

5. **Integration planning**
   - [ ] WhatsApp API contracts
   - [ ] OpenAI/Anthropic setup
   - [ ] Stripe/Pix integration

6. **Team & Timeline**
   - Define team size & skills
   - Allocate resources
   - Create detailed timeline
