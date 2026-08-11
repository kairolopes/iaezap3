const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dropTablesSQL = `
DROP TABLE IF EXISTS whatsapp_numbers CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
`;

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  cnpj TEXT UNIQUE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  owner_id UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_company ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_company ON conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_company ON whatsapp_numbers(company_id);
`;

async function setup() {
  try {
    console.log('🔄 Conectando ao Supabase...');

    console.log('🗑️  Deletando tabelas antigas...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropTablesSQL
    }).catch(async () => {
      // Fallback se rpc não funcionar - fazer manualmente
      const statements = dropTablesSQL.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim()) {
          await supabase.rpc('exec_sql', { sql: stmt });
        }
      }
      return { error: null };
    });

    console.log('✅ Criando tabelas novas...');
    const statements = createTablesSQL.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        if (error) console.log('⚠️  ', error);
      }
    }

    console.log('✅ Setup completo!');
    console.log('\n📋 Próximos passos:');
    console.log('1. cd backend && npm install');
    console.log('2. npm run start:dev');
    console.log('3. cd frontend && npm install');
    console.log('4. npm run dev');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setup();
