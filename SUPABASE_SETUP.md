# 🚀 IAEZAP + Supabase - Setup Rápido

## Pré-requisitos
- Node.js 18+
- Conta Supabase (https://supabase.com)

---

## 1️⃣ Criar Projeto Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Nome: `iaezap`
4. Copie as credenciais:
   - **SUPABASE_URL**
   - **SUPABASE_ANON_KEY**
   - **SUPABASE_SERVICE_ROLE_KEY**

---

## 2️⃣ Criar Tabelas no Supabase

No SQL Editor do Supabase, execute:

```sql
-- Users (Supabase Auth gerencia)
-- Criar profiles para estender auth

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  cnpj TEXT UNIQUE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  owner_id UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agents (Multi-Agent System)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('TRIAGE', 'SALES', 'SCHEDULING', 'SUPPORT')),
  personality TEXT DEFAULT 'Friendly',
  tone TEXT DEFAULT 'FRIENDLY',
  language TEXT DEFAULT 'pt-BR',
  instructions TEXT,
  can_respond_24h BOOLEAN DEFAULT FALSE,
  can_create_order BOOLEAN DEFAULT FALSE,
  can_schedule BOOLEAN DEFAULT FALSE,
  max_discount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  agent_id UUID REFERENCES agents ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED')),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT CHECK (sender IN ('CUSTOMER', 'AI', 'HUMAN')),
  sender_name TEXT DEFAULT 'Customer',
  is_from_ai BOOLEAN DEFAULT FALSE,
  confidence FLOAT,
  model_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (Knowledge Base)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies ON DELETE CASCADE,
  agent_id UUID REFERENCES agents ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('PDF', 'SPREADSHEET', 'FAQ', 'LINK', 'TEXT')),
  content TEXT,
  usage_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR')),
  external_id TEXT,
  access_token TEXT ENCRYPTED,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_whatsapp_company ON whatsapp_numbers(company_id);
```

---

## 3️⃣ Configurar Backend

### Copiar .env
```bash
cp backend/.env.example backend/.env
```

### Preencher .env
```
DATABASE_URL="postgresql://postgres:PASSWORD@INSTANCE.supabase.co:5432/postgres"
SUPABASE_URL="https://INSTANCE.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
NODE_ENV=development
PORT=3000
```

(Copiar as credenciais do Supabase)

### Instalar dependências
```bash
cd backend
npm install
```

### Iniciar backend
```bash
npm run start:dev
```

API roda em: http://localhost:3000

---

## 4️⃣ Configurar Frontend

### Instalar dependências
```bash
cd frontend
npm install
```

### Criar .env
```
VITE_SUPABASE_URL="https://INSTANCE.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
VITE_API_URL="http://localhost:3000"
```

### Iniciar frontend
```bash
npm run dev
```

Frontend roda em: http://localhost:5173

---

## 5️⃣ Seed (Criar Dados de Teste)

No Supabase SQL Editor:

```sql
-- Master admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('kairo@zapbaratinho.com.br', crypt('123456', gen_salt('bf')), NOW(), 'authenticated')
ON CONFLICT DO NOTHING;

-- Get user ID (execute depois)
SELECT id FROM auth.users WHERE email = 'kairo@zapbaratinho.com.br';

-- Profile
INSERT INTO profiles (id, name, email, role)
VALUES ('YOUR_USER_ID_HERE', 'Kairo', 'kairo@zapbaratinho.com.br', 'MASTER')
ON CONFLICT DO NOTHING;

-- Test Company
INSERT INTO companies (name, business_name, cnpj, owner_id)
VALUES ('Floral da Esquina', 'Floral da Esquina Ltda', '12345678000100', 'YOUR_USER_ID_HERE')
RETURNING id;

-- Test Agents (copiar company_id acima)
INSERT INTO agents (company_id, name, role, personality, instructions)
VALUES
  ('YOUR_COMPANY_ID', 'Iaê', 'TRIAGE', 'Friendly', 'Route to correct agent'),
  ('YOUR_COMPANY_ID', 'Sales Agent', 'SALES', 'Enthusiastic', 'Sell products'),
  ('YOUR_COMPANY_ID', 'Scheduler', 'SCHEDULING', 'Professional', 'Book deliveries'),
  ('YOUR_COMPANY_ID', 'Support', 'SUPPORT', 'Helpful', 'Post-sale support');
```

---

## 🔑 API Endpoints

### Agents
```
POST   /agents/:companyId        - Criar agente
GET    /agents/:companyId        - Listar agentes
GET    /agents/detail/:id        - Detalhe agente
PUT    /agents/:id               - Editar agente
DELETE /agents/:id               - Deletar agente
```

### Conversations
```
POST   /conversations/:companyId  - Criar conversa
GET    /conversations/:companyId  - Listar conversas
POST   /conversations/:id/messages - Adicionar mensagem
PATCH  /conversations/:id/status   - Atualizar status
```

---

## ✅ Pronto!

- ✅ Backend rodando em http://localhost:3000
- ✅ Frontend rodando em http://localhost:5173
- ✅ Supabase conectado
- ✅ Tabelas criadas

Próximo: Criar UI para agents CRUD no frontend!

---

## Stack Final
- **Backend**: NestJS + Supabase
- **Frontend**: React + Vite + Supabase-JS
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime (optional)

Zero Docker! 🚀
