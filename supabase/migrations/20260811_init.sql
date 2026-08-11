-- Drop existing tables
DROP TABLE IF EXISTS whatsapp_numbers CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  cnpj TEXT UNIQUE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  owner_id UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create agents
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

-- Create conversations
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

-- Create messages
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

-- Create documents
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

-- Create whatsapp_numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR')),
  external_id TEXT,
  access_token TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_company ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_company ON conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_company ON whatsapp_numbers(company_id);
