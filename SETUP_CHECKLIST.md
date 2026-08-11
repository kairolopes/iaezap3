# Checklist de Setup - Autenticação IAEZAP

Use este checklist para garantir que tudo foi implementado corretamente.

## Backend Setup

### Dependências
- [ ] `npm install` executado em `backend/`
- [ ] `@nestjs/jwt` instalado
- [ ] `@nestjs/passport` instalado
- [ ] `@nestjs/config` instalado
- [ ] `passport-jwt` instalado

Verificar com:
```bash
cd backend && npm list | grep -E "(jwt|passport|config)"
```

### Variáveis de Ambiente
- [ ] `.env` criado em `backend/`
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `JWT_SECRET` configurado
- [ ] `DATABASE_URL` configurado

Verificar com:
```bash
cd backend && cat .env | grep -E "SUPABASE|JWT"
```

### Arquivos Backend Criados
- [ ] `src/auth/jwt.guard.ts` existe
- [ ] `src/types/auth.ts` existe
- [ ] `.env.example` existe

Verificar com:
```bash
cd backend && ls -la src/auth/jwt.guard.ts src/types/auth.ts .env.example
```

### Arquivos Backend Modificados
- [ ] `package.json` atualizado
- [ ] `src/auth/auth.service.ts` integrado com Supabase
- [ ] `src/auth/auth.controller.ts` melhorado
- [ ] `src/auth/auth.module.ts` configurado com JWT
- [ ] `src/app.module.ts` importa AuthModule
- [ ] `src/agent/agent.controller.ts` protegido com JwtAuthGuard

Verificar conteúdo:
```bash
cd backend && grep -l "JwtAuthGuard\|SupabaseService" src/auth/*.ts src/agent/agent.controller.ts
```

### Backend Compilação
- [ ] Backend compila sem erros

Verificar com:
```bash
cd backend && npm run build
```

---

## Frontend Setup

### Dependências
- [ ] `npm install` executado em `frontend/`
- [ ] `@supabase/supabase-js` instalado
- [ ] `axios` já existe
- [ ] `zustand` já existe

Verificar com:
```bash
cd frontend && npm list | grep -E "(supabase|axios|zustand)"
```

### Arquivos Frontend Criados
- [ ] `src/api/client.ts` existe
- [ ] `src/hooks/useAuth.ts` existe
- [ ] `src/components/ProtectedRoute.tsx` existe

Verificar com:
```bash
cd frontend && ls -la src/api/client.ts src/hooks/useAuth.ts src/components/ProtectedRoute.tsx
```

### Arquivos Frontend Modificados
- [ ] `package.json` tem `@supabase/supabase-js`
- [ ] `src/store/auth.ts` usa Zustand + Axios
- [ ] `src/pages/LoginPage.tsx` melhorada
- [ ] `src/App.tsx` simplificado

Verificar com:
```bash
cd frontend && grep -l "useAuth\|api.post\|ProtectedRoute" src/**/*.ts src/**/*.tsx
```

---

## Supabase Setup

### Auth Configurado
- [ ] Supabase project criado
- [ ] Authentication habilitado
- [ ] Usuário de teste criado

Verificar em: https://app.supabase.com

### RLS (Row Level Security)
- [ ] RLS habilitado em tabelas (se usando dados do Supabase)

### JWT Secret
- [ ] JWT Secret do Supabase copiado (opcional, para verificar tokens)

---

## Testes Básicos

### Backend Online
- [ ] Backend rodando: `npm run start:dev` em `backend/`
- [ ] API responde em `http://localhost:3000`

Testar com:
```bash
curl http://localhost:3000/auth/me
# Deve retornar 401 (sem token) não error de conexão
```

### Login Funciona
- [ ] POST `/auth/login` retorna token
- [ ] Token é válido (contém payload JWT)

Testar com:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Rotas Protegidas
- [ ] GET `/auth/me` sem token retorna 401
- [ ] GET `/auth/me` com token retorna usuário

### Frontend Online
- [ ] Frontend rodando: `npm run dev` em `frontend/`
- [ ] Frontend acessível em `http://localhost:5173`

### Frontend Login
- [ ] Página de login carrega
- [ ] Pode fazer login
- [ ] localStorage recebe token após login
- [ ] Redirecionado para Dashboard após login

---

## Documentação

- [ ] `AUTH_IMPLEMENTATION.md` criado
- [ ] `FRONTEND_AUTH_GUIDE.md` criado
- [ ] `IMPLEMENTATION_SUMMARY.md` criado
- [ ] `TEST_AUTH.md` criado
- [ ] `PROTECTED_ROUTE_EXAMPLE.md` criado
- [ ] `SETUP_CHECKLIST.md` criado (este arquivo)

---

## Validação Final

### Fluxo Completo

Execute este teste passo a passo:

#### 1. Limpar Estado
```bash
# No console do browser
localStorage.clear()
```

#### 2. Login
```javascript
// No console
const email = 'seu@email.com'
const password = 'sua-senha'

const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

const data = await response.json()
console.log('Token:', data.token)
console.log('User:', data.user)
```

#### 3. Verificar localStorage
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('User:', JSON.parse(localStorage.getItem('user')))
```

#### 4. Rota Protegida
```javascript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:3000/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const data = await response.json()
console.log('Current User:', data)
```

#### 5. Logout
```javascript
localStorage.clear()
location.reload()
```

---

## Troubleshooting

### Problema: "Cannot find module"

**Solução:**
```bash
# Reinstalar dependências
rm -rf backend/node_modules frontend/node_modules
npm install --prefix backend
npm install --prefix frontend
```

### Problema: "ENOENT: no such file or directory, open '.env'"

**Solução:**
```bash
# Criar .env
cd backend
cp .env.example .env
# Editar .env com suas credenciais Supabase
```

### Problema: "Invalid credentials"

**Solução:**
1. Verificar email/senha no Supabase Auth
2. Usuário foi criado no Supabase?
3. Senha está correta?

### Problema: "JWT malformed"

**Solução:**
```bash
# Limpar token e fazer login novamente
# No console
localStorage.clear()
location.reload()
```

### Problema: "Cannot POST /auth/login"

**Solução:**
1. Backend está rodando? (`npm run start:dev`)
2. Porta está correta? (3000)
3. AuthModule está importado em app.module.ts?

### Problema: CORS Error

**Solução:**
1. Editar `src/api/client.ts`
2. Verificar `API_BASE_URL`
3. Deve ser `http://localhost:3000`

---

## Próximos Passos Depois do Setup

### Curto Prazo
1. [ ] Implementar refresh token
2. [ ] Adicionar validação de email
3. [ ] Página de forgot password
4. [ ] Tests E2E de auth

### Médio Prazo
1. [ ] Migrar para HttpOnly cookies
2. [ ] Implementar 2FA
3. [ ] Rate limiting
4. [ ] Audit logging

### Longo Prazo
1. [ ] Social login
2. [ ] Biometria
3. [ ] Session management
4. [ ] LDAP/AD integration

---

## Perguntas Frequentes

**P: Onde armazenar o token?**
R: No localStorage (atual) ou HttpOnly cookie (mais seguro, futuro)

**P: Como fazer refresh token?**
R: Backend gera novo token quando atual expira (implementar no response interceptor)

**P: Como validar token no Supabase?**
R: O backend já faz via JwtAuthGuard + validate()

**P: Posso usar token do Supabase direto?**
R: Não recomendado. Use token JWT do backend para maior controle.

**P: Como adicionar mais dados ao token?**
R: Editar `auth.service.ts` no `jwt.sign({...})`

**P: Como fazer logout?**
R: Backend: `POST /auth/logout`
Frontend: `logout()` do useAuth

---

## Comandos Úteis

```bash
# Reinstalar tudo
cd backend && npm install && npm run build
cd ../frontend && npm install

# Iniciar backend
cd backend && npm run start:dev

# Iniciar frontend
cd frontend && npm run dev

# Ver logs do backend
cd backend && npm run start:dev | grep -i error

# Limpar cache
cd backend && rm -rf dist node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# Testar API
curl http://localhost:3000/auth/me

# Formatar código
cd backend && npm run format
cd ../frontend && npm run format
```

---

## Suporte

Se encontrar problemas:

1. **Verificar logs:** `npm run start:dev` com output completo
2. **Verificar arquivo:** Leia `AUTH_IMPLEMENTATION.md`
3. **Testar manualmente:** Execute comandos em `TEST_AUTH.md`
4. **Debug console:** Abra DevTools e verifique localStorage/network

---

**Status de Setup:** ⏳ Pendente de Verificação

Após completar todos os itens acima e passar nos testes, mude para:

**Status de Setup:** ✅ Completo

---

Mantém este checklist a mão enquanto configura o projeto!
