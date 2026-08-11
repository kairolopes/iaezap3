# Guia de Autenticação no Frontend IAEZAP

## Visão Geral

O frontend usa Zustand para gerenciar estado de autenticação e Axios para fazer requisições HTTP com tokens automaticamente.

## Instalação

```bash
npm install
```

## Estrutura de Autenticação

### 1. Zustand Store (`src/store/auth.ts`)

Gerencia:
- `token` - JWT armazenado
- `user` - Dados do usuário
- `isLoading` - Status de carregamento
- `error` - Mensagem de erro
- Métodos: `login()`, `logout()`, `setUser()`, `checkAuth()`

### 2. API Client (`src/api/client.ts`)

Axios com interceptadores:
- **Request**: Adiciona token automaticamente
- **Response**: Trata 401 e redireciona para login

### 3. Hook useAuth (`src/hooks/useAuth.ts`)

Interface simplificada para o store:
```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

### 4. ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Protege rotas que requerem autenticação

## Uso Básico

### Login

```typescript
import { useAuth } from '../hooks/useAuth'

function LoginForm() {
  const { login, isLoading, error } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      // Usuário será redirecionado automaticamente
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleLogin('user@example.com', 'password')
    }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}
```

### Acessar Dados do Usuário

```typescript
import { useAuth } from '../hooks/useAuth'

function UserProfile() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Olá, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Papel: {user?.role}</p>
    </div>
  )
}
```

### Fazer Logout

```typescript
import { useAuth } from '../hooks/useAuth'

function LogoutButton() {
  const { logout } = useAuth()

  return <button onClick={logout}>Sair</button>
}
```

### Proteger Rotas

```typescript
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminDashboard } from './pages/AdminDashboard'

function App() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  )
}
```

### Fazer Requisição Autenticada

```typescript
import api from '../api/client'

async function getProtectedData() {
  try {
    const response = await api.get('/protected-route')
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Fluxo de Autenticação

```
┌─────────────────┐
│   LoginPage     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ useAuth() hook                      │
│ - Chama login(email, password)     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Zustand Store (auth.ts)            │
│ - Chama api.post('/auth/login')    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Axios Interceptor                  │
│ - Adiciona Headers se necessário   │
│ - Envia para backend                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend (NestJS)                   │
│ - POST /auth/login                 │
│ - Valida com Supabase              │
│ - Gera JWT                         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend Recebe                     │
│ - token                            │
│ - user data                        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Store Armazena                      │
│ - localStorage.setItem('token')    │
│ - Atualiza Zustand state           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ App Renderiza Dashboard             │
│ (token && user existem)            │
└─────────────────────────────────────┘
```

## Tratamento de Erros

### Erro de Login
```typescript
const { error, login } = useAuth()

const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password)
  } catch (err) {
    // error.value conterá a mensagem de erro
    console.error(error)
  }
}
```

### Token Expirado (401)
O interceptador de resposta automaticamente:
1. Limpa localStorage
2. Redireciona para /login

### Rede Offline
```typescript
const { login } = useAuth()

const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password)
  } catch (err) {
    if (err.message === 'Network Error') {
      // Lidar com erro de rede
      alert('Sem conexão com a internet')
    }
  }
}
```

## Boas Práticas

### 1. Sempre Use o Hook useAuth()
```typescript
// Bom
const { user } = useAuth()

// Evitar
const user = useAuthStore((state) => state.user)
```

### 2. Proteja Rotas Sensíveis
```typescript
// Bom
<ProtectedRoute requiredRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>

// Evitar
<AdminPanel />
```

### 3. Valide Token na Inicialização
```typescript
// Em App.tsx
useEffect(() => {
  checkAuth() // Carrega token do localStorage
}, [checkAuth])
```

### 4. Trate Erros de Autenticação
```typescript
const { error, isLoading } = useAuth()

return (
  <>
    {error && <ErrorMessage message={error} />}
    {isLoading && <Loading />}
  </>
)
```

## Variáveis de Ambiente

O frontend se conecta ao backend em:
```
http://localhost:3000
```

Para usar um servidor diferente, edite `src/api/client.ts`:
```typescript
const API_BASE_URL = 'https://seu-dominio.com'
```

## Debug

### Verificar Token Armazenado
```javascript
console.log(localStorage.getItem('token'))
console.log(JSON.parse(localStorage.getItem('user')))
```

### Verificar Headers de Requisição
Abra DevTools > Network > Clique numa requisição > Headers
Procure por: `Authorization: Bearer <token>`

### Limpar Autenticação
```javascript
localStorage.removeItem('token')
localStorage.removeItem('user')
window.location.reload()
```

## Próximos Passos

1. Implementar refresh token
2. Adicionar validação de email
3. Implementar "Esqueci a senha"
4. Adicionar social login
5. Implementar 2FA
