# 🌱 IAEZAP - Guia de Seed (Dados de Teste)

Este guia explica como popular o banco de dados IAEZAP com dados iniciais para testes.

---

## 📋 O que é criado?

O seed cria:

1. **Master User**
   - Email: `kairo@zapbaratinho.com.br`
   - Password: `Floral@2026`
   - Role: `MASTER`

2. **Company**
   - Nome: `Floral da Esquina`
   - CNPJ: `12.345.678/0001-00`
   - Timezone: `America/Sao_Paulo`

3. **4 Agentes IA**
   - **Iaê** (TRIAGE) - Roteador inteligente que encaminha para o agente correto
   - **Sales Agent** (SALES) - Vendedor de flores, pode criar pedidos e oferecer descontos de até 10%
   - **Scheduler** (SCHEDULING) - Agendador de entregas e atendimentos
   - **Support** (SUPPORT) - Suporte pós-venda, pode oferecer descontos de até 15%

---

## 🚀 Como usar?

### Opção 1: Executar via Node.js (Recomendado)

```bash
# 1. Certifique-se que o backend/.env está configurado
cat backend/.env

# 2. Execute o seed
node run-seed.js
```

**Output esperado:**
```
🔄 Conectando ao banco de dados...
✅ Conectado!

🌱 Inserindo dados de teste...

✅ Seed executado com sucesso!

📋 Dados criados:
  ✓ Master User: kairo@zapbaratinho.com.br
  ✓ Company: Floral da Esquina
  ✓ Agents:
    - Iaê (TRIAGE) - Roteador inteligente
    - Sales Agent (SALES) - Vendedor de flores
    - Scheduler (SCHEDULING) - Agendador de entregas
    - Support (SUPPORT) - Suporte pós-venda

🎉 Sistema pronto para testes!
```

### Opção 2: Executar junto com migrations

```bash
# Run migrations + seed automaticamente
# (Adicione a lógica no run-migrations.js se necessário)
node run-migrations.js
node run-seed.js
```

### Opção 3: Executar via SQL Editor do Supabase

1. Abra https://app.supabase.com
2. Acesse seu projeto IAEZAP
3. Vá para **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/seed.sql`
5. Cole no editor
6. Clique em **Run**

### Opção 4: Executar via psql (Command Line)

```bash
# Conecte ao banco Supabase
psql "postgresql://postgres:SEU_PASSWORD@db.SEU_PROJECT_REF.supabase.co:5432/postgres" \
  -f supabase/migrations/seed.sql
```

---

## ⚠️ Observações importantes

### Criação de Usuário
O seed tenta criar o usuário automaticamente na tabela `auth.users` usando a função `crypt()`.

**Se receber erro de permissão:**
```
ERROR: permission denied for schema public
```

**Solução**: Crie o usuário manualmente via Supabase Dashboard:
1. Vá em **Authentication** > **Users**
2. Clique em **Add user**
3. Email: `kairo@zapbaratinho.com.br`
4. Password: `Floral@2026`
5. Clique em **Create user**
6. Depois execute apenas o restante do seed (profiles, companies, agents)

### ID do Usuário
Se criar manualmente, o UUID do usuário será gerado pelo Supabase. O seed usa `ON CONFLICT DO NOTHING` para evitar erros se os dados já existem.

### Executar múltiplas vezes
O script é seguro para executar múltiplas vezes (usa `ON CONFLICT DO NOTHING`). Não vai criar duplicatas.

---

## 📝 Personalizar o Seed

Para modificar os dados, edite `supabase/migrations/seed.sql`:

### Mudar email do master user
```sql
WHERE email = 'SEU_EMAIL@AQUI'
```

### Mudar nome da company
```sql
name = 'Seu Nome de Company'
```

### Adicionar/Modificar agents
Copie a seção de um agent e customize os campos:
- `name`: Nome do agente
- `role`: TRIAGE, SALES, SCHEDULING ou SUPPORT
- `personality`: Descrição da personalidade
- `tone`: FRIENDLY, PROFESSIONAL, HELPFUL
- `instructions`: Instruções para o IA
- `can_respond_24h`: true/false
- `can_create_order`: true/false (apenas SALES)
- `can_schedule`: true/false (apenas SCHEDULING)
- `max_discount`: Percentual máximo de desconto

---

## 🔍 Verificar se funcionou

### Via SQL (Supabase Console)
```sql
-- Ver master user
SELECT id, email, role FROM auth.users WHERE email = 'kairo@zapbaratinho.com.br';

-- Ver profile
SELECT * FROM profiles WHERE email = 'kairo@zapbaratinho.com.br';

-- Ver company
SELECT * FROM companies WHERE name = 'Floral da Esquina';

-- Ver agents
SELECT name, role FROM agents 
WHERE company_id = (SELECT id FROM companies WHERE name = 'Floral da Esquina');
```

### Via API (Se backend estiver rodando)
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kairo@zapbaratinho.com.br","password":"Floral@2026"}'

# Listar agents
curl http://localhost:3000/agents/COMPANY_ID
```

---

## 🗑️ Limpar e reiniciar

Se precisar resetar tudo:

```bash
# 1. Execute as migrations (vai deletar as tabelas e recriá-las)
node run-migrations.js

# 2. Execute o seed novamente
node run-seed.js
```

---

## 📚 Estrutura de dados

```
auth.users (Supabase Auth)
└── kairo@zapbaratinho.com.br

profiles
└── kairo@zapbaratinho.com.br (MASTER)

companies
└── Floral da Esquina (owner: kairo)
    └── agents
        ├── Iaê (TRIAGE)
        ├── Sales Agent (SALES)
        ├── Scheduler (SCHEDULING)
        └── Support (SUPPORT)
```

---

## 💡 Próximos passos

1. **Crie uma conversa de teste**
   ```sql
   INSERT INTO conversations (
     company_id, customer_phone, status
   ) VALUES (
     (SELECT id FROM companies WHERE name = 'Floral da Esquina'),
     '+5511999999999',
     'OPEN'
   );
   ```

2. **Adicione mensagens**
   ```sql
   INSERT INTO messages (conversation_id, text, sender, is_from_ai)
   VALUES (CONVERSATION_ID, 'Olá!', 'CUSTOMER', false);
   ```

3. **Implemente a lógica de routing** para Iaê encaminhar mensagens aos agentes corretos

---

## 🆘 Troubleshooting

| Erro | Solução |
|------|---------|
| `password authentication failed` | Verifique a senha no PostgreSQL (https://app.supabase.com/account/password) |
| `permission denied` | Use Supabase Dashboard ou um usuário com mais permissões |
| `UNIQUE violation` | Os dados já foram criados. Execute `ON CONFLICT` é seguro |
| `foreign key violation` | A company ou user não existe. Verifique a ordem de execução |

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o `backend/.env` está correto
2. Teste a conexão: `psql` com suas credenciais
3. Verifique a estrutura das tabelas no Supabase Console

---

**Última atualização:** 2026-08-11
**Versão:** 1.0
