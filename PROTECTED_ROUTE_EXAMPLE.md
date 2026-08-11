# Exemplo: Criando Rotas Protegidas com Autenticação

## Backend (NestJS)

### 1. Controller com Rota Protegida

```typescript
// src/company/company.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common'
import { CompanyService } from './company.service'
import { JwtAuthGuard } from '../auth/jwt.guard'

@Controller('companies')
@UseGuards(JwtAuthGuard) // Todas as rotas neste controller requerem JWT
export class CompanyController {
  constructor(private company: CompanyService) {}

  // GET /companies - Listar empresas do usuário
  @Get()
  async getMyCompanies(@Request() req: any) {
    // req.user contém: { id, email, role, companyId, ... }
    return this.company.getByUserId(req.user.id)
  }

  // GET /companies/:id - Detalhe da empresa
  @Get(':id')
  async getCompany(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    // Verificar se usuário tem permissão
    const company = await this.company.findOne(id)
    if (company.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Sem permissão')
    }
    return company
  }

  // POST /companies - Criar nova empresa
  @Post()
  async createCompany(
    @Body() data: { name: string; description?: string },
    @Request() req: any,
  ) {
    // Criar empresa vinculada ao usuário autenticado
    return this.company.create({
      ...data,
      userId: req.user.id,
    })
  }
}
```

### 2. Registrar Controller no Module

```typescript
// src/company/company.module.ts

import { Module } from '@nestjs/common'
import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule], // Importar AuthModule para usar JwtAuthGuard
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
```

### 3. Service com Lógica de Segurança

```typescript
// src/company/company.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  // Buscar empresas do usuário
  async getByUserId(userId: string) {
    return this.prisma.company.findMany({
      where: { userId },
      include: { agents: true },
    })
  }

  // Buscar empresa específica com validação
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        agents: { where: { isActive: true } },
        conversations: { take: 10 },
      },
    })

    if (!company) {
      throw new NotFoundException('Empresa não encontrada')
    }

    return company
  }

  // Criar empresa
  async create(data: { name: string; userId: string; description?: string }) {
    return this.prisma.company.create({
      data,
    })
  }

  // Atualizar empresa (com verificação de propriedade)
  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string },
  ) {
    const company = await this.findOne(id)

    // Validar propriedade
    if (company.userId !== userId) {
      throw new ForbiddenException('Você não pode editar esta empresa')
    }

    return this.prisma.company.update({
      where: { id },
      data,
    })
  }

  // Deletar empresa (com verificação)
  async delete(id: string, userId: string) {
    const company = await this.findOne(id)

    if (company.userId !== userId) {
      throw new ForbiddenException('Você não pode deletar esta empresa')
    }

    return this.prisma.company.delete({
      where: { id },
    })
  }
}
```

---

## Frontend (React)

### 1. Hook Customizado para Empresas

```typescript
// src/hooks/useCompanies.ts

import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './useAuth'

interface Company {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  agentsCount: number
}

export function useCompanies() {
  const { isAuthenticated } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar empresas
  const fetchCompanies = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/companies')
      setCompanies(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  // Criar empresa
  const createCompany = async (name: string, description?: string) => {
    try {
      const response = await api.post('/companies', { name, description })
      setCompanies([...companies, response.data])
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar empresa')
    }
  }

  // Atualizar empresa
  const updateCompany = async (id: string, data: any) => {
    try {
      const response = await api.put(`/companies/${id}`, data)
      setCompanies(
        companies.map((c) => (c.id === id ? response.data : c)),
      )
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar')
    }
  }

  // Deletar empresa
  const deleteCompany = async (id: string) => {
    try {
      await api.delete(`/companies/${id}`)
      setCompanies(companies.filter((c) => c.id !== id))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao deletar')
    }
  }

  // Buscar na primeira renderização
  useEffect(() => {
    fetchCompanies()
  }, [isAuthenticated])

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  }
}
```

### 2. Componente com Proteção

```typescript
// src/pages/CompaniesPage.tsx

import { useState } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useCompanies } from '../hooks/useCompanies'

function CompaniesPageContent() {
  const { companies, loading, error, createCompany, deleteCompany } =
    useCompanies()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsCreating(true)
    try {
      await createCompany(newName)
      setNewName('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return

    try {
      await deleteCompany(id)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Minhas Empresas</h1>

      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: '30px' }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da empresa"
          disabled={isCreating}
          style={{
            padding: '10px',
            marginRight: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={isCreating}
          style={{
            padding: '10px 20px',
            background: '#9184d9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
          }}
        >
          {isCreating ? 'Criando...' : 'Nova Empresa'}
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          {companies.length === 0 ? (
            <p>Nenhuma empresa. Crie a primeira!</p>
          ) : (
            <ul>
              {companies.map((company) => (
                <li
                  key={company.id}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <strong>{company.name}</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {company.description}
                    </p>
                    <button
                      onClick={() => handleDelete(company.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Deletar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function CompaniesPage() {
  return (
    <ProtectedRoute>
      <CompaniesPageContent />
    </ProtectedRoute>
  )
}
```

### 3. Usando no App

```typescript
// src/App.tsx

import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { CompaniesPage } from './pages/CompaniesPage'

export function App() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!token || !user) {
    return <LoginPage />
  }

  // Roteamento simples
  const [currentPage] = // ... router logic

  return (
    <>
      {currentPage === 'companies' && <CompaniesPage />}
      {currentPage === 'dashboard' && <Dashboard />}
    </>
  )
}
```

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario no Frontend                                      │
│    - Clica "Nova Empresa"                                   │
│    - Preenche formulário                                    │
│    - Clica "Criar"                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. useCompanies Hook                                        │
│    - Chama api.post('/companies', data)                    │
│    - Axios interceptor adiciona token                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend                                                  │
│    - POST /companies                                        │
│    - JwtAuthGuard valida token                            │
│    - CompanyController.create()                           │
│    - Vincula empresa ao usuário                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend Recebe                                          │
│    - Empresa criada com ID                                │
│    - Atualiza lista localmente                            │
│    - Mostra sucesso                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Boas Práticas

1. **Sempre use @UseGuards(JwtAuthGuard)** em rotas protegidas
2. **Sempre valide propriedade** antes de atualizar/deletar
3. **Sempre trate erros** no frontend
4. **Sempre use useAuth()** para verificar autenticação
5. **Sempre use ProtectedRoute** em páginas sensíveis

---

## Testes com cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'

# Salve o token retornado em uma variável:
# TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Criar empresa
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Minha Empresa","description":"Descrição"}'

# 3. Listar empresas
curl -X GET http://localhost:3000/companies \
  -H "Authorization: Bearer $TOKEN"

# 4. Deletar empresa
curl -X DELETE http://localhost:3000/companies/COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"
```
