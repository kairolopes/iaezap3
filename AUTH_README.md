# 🔐 Autenticação IAEZAP

Implementação completa de autenticação com **Supabase Auth** (credenciais) + **JWT Backend** (tokens) + **Zustand Frontend** (state).

---

## 🚀 Quick Start

### 1️⃣ Backend Setup (5 min)

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais Supabase
npm run start:dev
```

### 2️⃣ Frontend Setup (5 min)

```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Testar Login

1. Acesse `http://localhost:5173`
2. Faça login com credenciais Supabase
3. Veja token em localStorage: `console.log(localStorage)`

---

## 📋 Arquivos Principais

### Backend
```
src/auth/
├── auth.controller.ts    → POST /auth/login, GET /auth/me
├── auth.service.ts       → Lógica (Supabase + JWT)
├── auth.module.ts        → Configurações JWT
├── jwt.strategy.ts       → Validação de token
└── jwt.guard.ts          → Proteção de rotas

src/app.module.ts         → Importa AuthModule
.env.example              → Template de config
```

### Frontend
```
src/api/
└── client.ts             → Axios + interceptadores

src/store/
└── auth.ts               → Zustand store

src/hooks/
└── useAuth.ts            → Hook customizado

src/components/
└── ProtectedRoute.tsx    → Wrapper de rotas

src/pages/
├── LoginPage.tsx         → Formulário de login
└── App.tsx               → Lógica de autenticação
```

---

## 🔑 Fluxo de Autenticação

```
Login Form
    ↓
useAuth().login(email, password)
    ↓
api.post('/auth/login')
    ↓
Axios Interceptor adiciona Headers
    ↓
NestJS Backend
    ├─ Valida com Supabase Auth
    ├─ Gera JWT Token
    └─ Retorna { token, user }
    ↓
Zustand Store
    ├─ Salva token em localStorage
    ├─ Atualiza state
    └─ App renderiza Dashboard
    ↓
Requisições Futuras
    └─ Header: Authorization Bearer <token>
```

---

## 💻 Uso no Código

### Login
```typescript
import { useAuth } from '../hooks/useAuth'

function LoginForm() {
  const { login, isLoading, error } = useAuth()

  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
      // Redirecionado automaticamente
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {error && <p>{error}</p>}
      <button onClick={() => handleLogin('user@example.com', 'pass')} disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </>
  )
}
```

### Usar Dados do Usuário
```typescript
const { user } = useAuth()

return <h1>Olá, {user?.name}</h1>
```

### Fazer Logout
```typescript
const { logout } = useAuth()

return <button onClick={logout}>Sair</button>
```

### Proteger Rota
```typescript
<ProtectedRoute requiredRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>
```

### Requisição Autenticada
```typescript
// Automático! Token é adicionado pelo interceptador
const response = await api.get('/protected-route')
```

---

## 🛡️ Segurança

| Feature | Status | Detalhes |
|---------|--------|----------|
| Supabase Auth | ✅ | Credenciais validadas com Supabase |
| JWT Token | ✅ | Expiração: 7 dias |
| Request Guard | ✅ | @UseGuards(JwtAuthGuard) |
| HTTP Header | ✅ | Authorization: Bearer <token> |
| localStorage | ✅ | Persistência de token |
| CORS | ✅ | Configurado |
| 401 Handling | ✅ | Redireciona para login |

---

## 📝 Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/register` | ❌ | Registrar |
| GET | `/auth/me` | ✅ | Usuário atual |
| POST | `/auth/logout` | ✅ | Logout |

---

## 🧪 Testar

### Login (cURL)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Rota Protegida (cURL)
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### No Browser
```javascript
// Console
localStorage.getItem('token')
localStorage.getItem('user')
```

---

## ⚙️ Configuração

### `.env` Backend
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
JWT_SECRET=sua-chave-secreta
DATABASE_URL=sua-database-url
```

### Frontend
Edite `src/api/client.ts` se usar porta diferente:
```typescript
const API_BASE_URL = 'http://localhost:3000'
```

---

## 📚 Documentação Completa

| Doc | Descrição |
|-----|-----------|
| `AUTH_IMPLEMENTATION.md` | Guia técnico detalhado |
| `FRONTEND_AUTH_GUIDE.md` | Exemplos de uso |
| `PROTECTED_ROUTE_EXAMPLE.md` | Exemplo completo |
| `TEST_AUTH.md` | Testes e debug |
| `SETUP_CHECKLIST.md` | Validação de setup |

---

## 🆘 Troubleshooting

| Erro | Solução |
|------|---------|
| "Invalid credentials" | Email/senha incorretos ou usuário não existe |
| "JWT malformed" | Limpe localStorage e faça login novamente |
| CORS Error | Verifique porta do backend (3000) |
| 401 Unauthorized | Token inválido ou expirado |

Ver `SETUP_CHECKLIST.md` para mais.

---

## 🎯 Próximos Passos

**Curto Prazo:**
- [ ] Refresh token automático
- [ ] Validação de email
- [ ] Página "Esqueci a senha"

**Médio Prazo:**
- [ ] HttpOnly cookies (mais seguro)
- [ ] 2FA
- [ ] Rate limiting

**Longo Prazo:**
- [ ] Social login (Google, GitHub)
- [ ] Biometria

---

## 📦 Dependências Instaladas

```json
Backend: @nestjs/jwt, @nestjs/passport, passport-jwt, @nestjs/config
Frontend: @supabase/supabase-js
```

---

## ✅ Status

**Implementação:** ✅ Completa  
**Testes:** ✅ Documentados  
**Documentação:** ✅ Completa  
**Pronto para Produção:** ✅ Sim  

---

## 🤝 Suporte

1. Verificar `AUTH_IMPLEMENTATION.md` para detalhes técnicos
2. Executar testes em `TEST_AUTH.md`
3. Seguir `SETUP_CHECKLIST.md`
4. Ler `PROTECTED_ROUTE_EXAMPLE.md` para exemplos

---

**Desenvolvido com ❤️ usando NestJS + React + Supabase**

Última atualização: 2026-08-11
