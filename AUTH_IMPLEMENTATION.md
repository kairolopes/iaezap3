# Implementação de Autenticação IAEZAP

## Visão Geral

A autenticação do IAEZAP integra Supabase Auth (autenticação segura) com JWT no backend para manter sessões seguras.

### Fluxo de Autenticação

```
1. Usuário entra credenciais (email/senha) no LoginPage
2. Frontend envia POST /auth/login ao backend
3. Backend valida contra Supabase Auth
4. Backend gera JWT token e retorna ao frontend
5. Frontend salva token em localStorage
6. Requisições subsequentes incluem token no header Authorization
7. Backend valida token com JwtAuthGuard
8. Acesso concedido ao recurso protegido
```

## Configuração Backend

### Dependências Instaladas

- `@nestjs/jwt` - Geração e validação de JWT
- `@nestjs/passport` - Integração com Passport
- `passport-jwt` - Estratégia JWT do Passport
- `@supabase/supabase-js` - Cliente Supabase

### Variáveis de Ambiente

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key-change-in-production
```

### Arquivos Backend

1. **auth/auth.service.ts** - Serviço de autenticação
   - `login(email, password)` - Autentica com Supabase
   - `register(email, password, name)` - Registra novo usuário
   - `validateToken(payload)` - Valida JWT payload

2. **auth/auth.controller.ts** - Controller de autenticação
   - `POST /auth/login` - Faz login
   - `POST /auth/register` - Registra novo usuário
   - `GET /auth/me` - Retorna usuário atual (protegido)
   - `POST /auth/logout` - Faz logout

3. **auth/jwt.strategy.ts** - Estratégia JWT do Passport
   - Extrai token do header Authorization
   - Valida assinatura do token
   - Executa função validate() após validação

4. **auth/jwt.guard.ts** - Guard para proteger rotas
   - Usado com `@UseGuards(JwtAuthGuard)` em controllers
   - Bloqueia acesso se não houver token válido

5. **supabase/supabase.service.ts** - Cliente Supabase
   - `login(email, password)` - Autentica com Supabase Auth
   - `signup(email, password)` - Registra no Supabase Auth

### Protegendo Rotas

```typescript
import { UseGuards, Get } from '@nestjs/common'
import { JwtAuthGuard } from './auth/jwt.guard'

@Get('protected-route')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Request() req) {
  // req.user contém o usuário validado
  return req.user
}
```

## Configuração Frontend

### Dependências Instaladas

- `axios` - Cliente HTTP
- `zustand` - State management
- `@supabase/supabase-js` - Cliente Supabase (opcional para usar no frontend)

### Arquivos Frontend

1. **store/auth.ts** - Zustand store de autenticação
   - `token` - JWT token armazenado
   - `user` - Dados do usuário logado
   - `login(email, password)` - Faz login
   - `logout()` - Faz logout
   - `checkAuth()` - Verifica autenticação ao carregar

2. **api/client.ts** - Cliente Axios com interceptadores
   - **Request Interceptor**: Adiciona token em todas as requisições
   - **Response Interceptor**: Trata erros 401 (token expirado)

3. **pages/LoginPage.tsx** - Página de login
   - Formulário de email/senha
   - Integrado com Zustand store
   - Mostra erros de autenticação

4. **App.tsx** - App principal
   - Verifica se usuário está autenticado
   - Renderiza LoginPage ou Dashboard

## Fluxo Detalhado de Login

### 1. Usuário Submete Formulário
```typescript
// LoginPage.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  await login(email, password) // Do Zustand store
}
```

### 2. Store Faz Requisição
```typescript
// store/auth.ts
login: async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password })
  const { token, user } = response.data
  localStorage.setItem('token', token)
  set({ token, user })
}
```

### 3. Backend Processa
```typescript
// auth.controller.ts
@Post('login')
async login(@Body() body: { email: string; password: string }) {
  return this.auth.login(body.email, body.password)
}

// auth.service.ts
async login(email: string, password: string) {
  // 1. Autentica com Supabase
  const { data, error } = await this.supabase.login(email, password)
  
  // 2. Gera JWT
  const token = this.jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
  
  // 3. Retorna token + user
  return { token, user }
}
```

### 4. Frontend Armazena Token
```typescript
// store/auth.ts
localStorage.setItem('token', token)
set({ token, user })
```

## Armazenamento de Dados

### LocalStorage
```typescript
localStorage.getItem('token')     // JWT token
localStorage.getItem('user')      // JSON com dados do usuário
```

### Zustand Store
```typescript
const { token, user } = useAuthStore()
```

## Requisições Autenticadas

### Com Interceptador
```typescript
// Qualquer requisição feita com api.post(), api.get(), etc.
const response = await api.post('/protected-route')
// Token é adicionado automaticamente no header
```

### Header Enviado
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Tratamento de Erros

### 401 - Token Expirado
```typescript
// api/client.ts - Response Interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  // Limpa token e redireciona para login
  localStorage.removeItem('token')
  window.location.href = '/login'
}
```

### Validação no Backend
```typescript
// jwt.strategy.ts
async validate(payload: any) {
  const user = await this.auth.validateToken(payload)
  if (!user) throw new UnauthorizedException('User not found')
  return user
}
```

## Segurança

1. **Supabase Auth**: Credenciais não são armazenadas no frontend
2. **JWT com Expiração**: Token expira em 7 dias
3. **HTTPS em Produção**: Tokens são transmitidos com segurança
4. **HttpOnly em Cookies**: (Futuro) Migrar para HttpOnly cookies
5. **CORS**: Configure CORS adequadamente no backend

## Próximos Passos

1. Implementar refresh token automático
2. Migrar token para HttpOnly cookie (mais seguro)
3. Adicionar 2FA (autenticação de dois fatores)
4. Implementar "Remember Me"
5. Adicionar social login (Google, GitHub)

## Testando

### 1. Criar Usuário no Supabase
- Acesse seu dashboard Supabase
- Vá em Authentication > Users
- Clique "Invite"
- Preencha email e senha

### 2. Testar Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}'
```

### 3. Testar Rota Protegida
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"
```
