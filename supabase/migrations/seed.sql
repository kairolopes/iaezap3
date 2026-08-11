-- ============================================
-- IAEZAP SEED - Dados Iniciais de Teste
-- ============================================
-- Script para popular banco com:
-- 1. Master user: kairo@zapbaratinho.com.br
-- 2. Company: Floral da Esquina
-- 3. 4 Agents: Iaê, Sales Agent, Scheduler, Support

-- ============================================
-- 1. CRIAR MASTER USER (auth.users)
-- ============================================
-- Nota: Este insert pode precisar de permissões especiais no Supabase
-- Se receber erro de permissão, crie o usuário via Supabase Dashboard

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'kairo@zapbaratinho.com.br',
  crypt('Floral@2026', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CRIAR PROFILE DO MASTER USER
-- ============================================
INSERT INTO profiles (id, name, email, role, created_at)
SELECT
  id,
  'Kairo Lopes',
  'kairo@zapbaratinho.com.br',
  'MASTER',
  NOW()
FROM auth.users
WHERE email = 'kairo@zapbaratinho.com.br'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. CRIAR COMPANY
-- ============================================
INSERT INTO companies (
  id,
  name,
  business_name,
  cnpj,
  timezone,
  owner_id,
  created_at
)
SELECT
  gen_random_uuid(),
  'Floral da Esquina',
  'Floral da Esquina Ltda.',
  '12.345.678/0001-00',
  'America/Sao_Paulo',
  id,
  NOW()
FROM auth.users
WHERE email = 'kairo@zapbaratinho.com.br'
ON CONFLICT (cnpj) DO NOTHING;

-- ============================================
-- 4. CRIAR AGENTES
-- ============================================
-- Iaê - Agent TRIAGE (Roteador)
WITH company_lookup AS (
  SELECT id FROM companies WHERE name = 'Floral da Esquina' LIMIT 1
)
INSERT INTO agents (
  id,
  company_id,
  name,
  role,
  personality,
  tone,
  language,
  instructions,
  can_respond_24h,
  can_create_order,
  can_schedule,
  max_discount,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  company_lookup.id,
  'Iaê',
  'TRIAGE',
  'Amigável e eficiente',
  'FRIENDLY',
  'pt-BR',
  'Você é Iaê, o agente de triagem. Analise a mensagem do cliente e encaminhe para o agente correto: Sales para pedidos, Scheduler para agendamentos, Support para problemas. Sempre seja educado e compreensivo.',
  true,
  false,
  false,
  0,
  true,
  NOW(),
  NOW()
FROM company_lookup
ON CONFLICT DO NOTHING;

-- Sales Agent - Agent SALES
WITH company_lookup AS (
  SELECT id FROM companies WHERE name = 'Floral da Esquina' LIMIT 1
)
INSERT INTO agents (
  id,
  company_id,
  name,
  role,
  personality,
  tone,
  language,
  instructions,
  can_respond_24h,
  can_create_order,
  can_schedule,
  max_discount,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  company_lookup.id,
  'Sales Agent',
  'SALES',
  'Entusiasmado e persuasivo',
  'FRIENDLY',
  'pt-BR',
  'Você é um vendedor profissional de flores. Apresente os produtos de forma atrativa, responda dúvidas sobre variedades, preços e ofertas especiais. Sempre tente identificar as necessidades do cliente e sugerir os melhores arranjos.',
  true,
  true,
  false,
  10,
  true,
  NOW(),
  NOW()
FROM company_lookup
ON CONFLICT DO NOTHING;

-- Scheduler - Agent SCHEDULING
WITH company_lookup AS (
  SELECT id FROM companies WHERE name = 'Floral da Esquina' LIMIT 1
)
INSERT INTO agents (
  id,
  company_id,
  name,
  role,
  personality,
  tone,
  language,
  instructions,
  can_respond_24h,
  can_create_order,
  can_schedule,
  max_discount,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  company_lookup.id,
  'Scheduler',
  'SCHEDULING',
  'Profissional e organizador',
  'PROFESSIONAL',
  'pt-BR',
  'Você é responsável por agendar entregas e atendimentos. Confirme a data, horário e localização da entrega. Ofereça opções de horário que estão disponíveis e garanta que o cliente tenha as melhores experiências de entrega.',
  true,
  false,
  true,
  0,
  true,
  NOW(),
  NOW()
FROM company_lookup
ON CONFLICT DO NOTHING;

-- Support - Agent SUPPORT
WITH company_lookup AS (
  SELECT id FROM companies WHERE name = 'Floral da Esquina' LIMIT 1
)
INSERT INTO agents (
  id,
  company_id,
  name,
  role,
  personality,
  tone,
  language,
  instructions,
  can_respond_24h,
  can_create_order,
  can_schedule,
  max_discount,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  company_lookup.id,
  'Support',
  'SUPPORT',
  'Empático e atencioso',
  'HELPFUL',
  'pt-BR',
  'Você é especialista em suporte pós-venda. Resolva problemas com entregas, qualidade dos produtos, devoluções ou trocas. Seja empático, ouça o cliente e ofereça as melhores soluções possíveis.',
  true,
  false,
  false,
  15,
  true,
  NOW(),
  NOW()
FROM company_lookup
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DO SEED
-- ============================================
-- Executado com sucesso!
-- Dados criados:
-- ✓ Master User: kairo@zapbaratinho.com.br
-- ✓ Company: Floral da Esquina
-- ✓ 4 Agents: Iaê, Sales Agent, Scheduler, Support
-- ============================================
