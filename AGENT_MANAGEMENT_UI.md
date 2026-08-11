# Agent Management UI - Documentação

## Visão Geral

Sistema completo de gerenciamento de agentes de IA no React frontend com integração aos endpoints do backend.

## Componentes Implementados

### 1. **AgentList.tsx**
Local: `frontend/src/components/AgentList.tsx`

Página de listagem de agentes com:
- ✅ Cards responsivos exibindo cada agente
- ✅ Dados do agente: nome, role, tom, personalidade, status
- ✅ Indicador visual de status (Ativo/Inativo)
- ✅ Botões de ação: Editar e Deletar
- ✅ Botão "Criar novo agente"
- ✅ Estados de carregamento e erro
- ✅ Fetch automático ao montar o componente

**Props:** Nenhuma (usa context do useAuthStore)

**State Management:**
- `agents`: Array de agentes
- `loading`: Estado de carregamento
- `error`: Mensagens de erro
- `showForm`: Controla visibilidade do modal
- `editingAgent`: Agente sendo editado

**Endpoints utilizados:**
- `GET /agents/:companyId` - Listar agentes
- `DELETE /agents/:id` - Deletar agente

### 2. **AgentForm.tsx**
Local: `frontend/src/components/AgentForm.tsx`

Modal para criar e editar agentes com:
- ✅ Campos de entrada: name, role, personality, tone, instructions, maxDiscount
- ✅ Selects para role e tone (populados dinamicamente)
- ✅ TextArea para instruções longas
- ✅ Checkboxes para funcionalidades: 24h, Criar Pedidos, Agendar
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de erros com feedback
- ✅ Estados de loading durante envio

**Props:**
```typescript
interface AgentFormProps {
  agent?: Agent | null      // Agente para edição (opcional)
  onClose: () => void       // Callback para fechar modal
  onSuccess: () => void     // Callback para sucesso (atualiza lista)
}
```

**Endpoints utilizados:**
- `POST /agents/:companyId` - Criar novo agente
- `PUT /agents/:id` - Atualizar agente existente
- `GET /agents/meta/roles` - Obter lista de roles disponíveis
- `GET /agents/meta/tones` - Obter lista de tones disponíveis

### 3. **Dashboard.tsx** (Atualizado)
Local: `frontend/src/pages/Dashboard.tsx`

Dashboard principal com:
- ✅ Sidebar de navegação integrada
- ✅ Integração com AgentList no tab "Agentes"
- ✅ Layout responsivo com margin esquerdo para sidebar fixa
- ✅ Suporte a múltiplos tabs (conversations, agents, products, analytics, settings)
- ✅ Melhorias visuais (hover states, transições)

## Estrutura de Dados - Agent

```typescript
interface Agent {
  id: string              // UUID do agente
  name: string            // Nome do agente
  role: string            // Função (TRIAGE, SALES, SCHEDULING, SUPPORT)
  personality: string     // Personalidade do agente
  tone: string            // Tom de voz (FRIENDLY, PROFESSIONAL, FORMAL, FUNNY)
  instructions: string    // Instruções e comportamento
  is_active: boolean      // Status ativo/inativo
  can_respond_24h: boolean        // Pode responder 24 horas
  can_create_order: boolean       // Pode criar pedidos
  can_schedule: boolean           // Pode agendar
  max_discount: number            // Desconto máximo permitido (%)
}
```

## Design System - Nocturne Tokens

Todos os componentes usam os tokens Nocturne:

### Cores Principais
```
Background (dark): #161826
Surface (dark): #1d1f2e, #131523
Text (light): #e9e9ed
Text (muted): #9397ab
Border: #292b31
Purple (accent): #9184d9, #d2cefd, #423a6a
Green (success): #22c55e, #86efac
Red (error): #ef4444, #fca5a5
```

### Estilos Aplicados
- Inline styles com transições suaves (0.2s)
- Hover states em todos os botões
- Bordas arredondadas (8px padrão)
- Padding/margin consistente
- Tipografia: 14px base, 12px secundário

## Integração e Uso

### 1. Verificar que os arquivos estão no lugar certo:

```
frontend/src/
├── components/
│   ├── AgentList.tsx      ✅ Novo
│   └── AgentForm.tsx      ✅ Novo
├── pages/
│   ├── Dashboard.tsx      ✅ Atualizado
│   └── LoginPage.tsx
└── store/
    └── auth.ts
```

### 2. O componente AgentList já está integrado no Dashboard

No tab "Agentes", o Dashboard renderiza:
```jsx
{activeTab === 'agents' && (
  <AgentList />
)}
```

### 3. Fluxo de uso:

1. Usuário clica em "Agentes" na sidebar
2. Dashboard renderiza AgentList
3. AgentList carrega agentes via GET /agents/:companyId
4. Usuário pode:
   - Ver lista de agentes em cards
   - Clicar em "✏️ Editar" para abrir AgentForm com dados do agente
   - Clicar em "🗑️ Deletar" para remover agente
   - Clicar em "➕ Criar novo agente" para abrir AgentForm vazio

### 4. Para criar novo agente:

1. Clique em "➕ Criar novo agente"
2. AgentForm abre como modal
3. Preencha os campos obrigatórios (nome, função, tom)
4. Configure permissões com checkboxes
5. Clique "Salvar Agente"
6. POST /agents/:companyId é enviado
7. AgentList é atualizada automaticamente

### 5. Para editar agente:

1. Clique em "✏️ Editar" no card do agente
2. AgentForm abre com dados preenchidos
3. Faça as alterações
4. Clique "Salvar Agente"
5. PUT /agents/:id é enviado
6. AgentList é atualizada automaticamente

## Autenticação

Todos os requests incluem header de autorização:
```javascript
'Authorization': `Bearer ${token}`
```

O token é obtido de `useAuthStore()` que possui:
- `user.companyId` - ID da empresa (usado em requests)
- `token` - Token JWT para autenticação

## Tratamento de Erros

### AgentList
- Exibe mensagem de erro em banner vermelho
- Retry automático de fetch quando necessário
- Estados vazios quando nenhum agente existe

### AgentForm
- Validação de campo obrigatório (name)
- Mensagens de erro específicas por campo
- Estado disabled no botão durante envio
- Tratamento de erros da API

## Endpoints Esperados do Backend

```
POST /agents/:companyId
  Body: { name, role, personality, tone, instructions, canRespond24h, ... }
  Response: { id, ... }

GET /agents/:companyId
  Response: Agent[]

GET /agents/detail/:id
  Response: Agent

PUT /agents/:id
  Body: { name, role, personality, tone, ... }
  Response: Agent

DELETE /agents/:id
  Response: void

GET /agents/meta/roles
  Response: string[] (ex: ['TRIAGE', 'SALES', 'SCHEDULING', 'SUPPORT'])

GET /agents/meta/tones
  Response: string[] (ex: ['FRIENDLY', 'PROFESSIONAL', 'FORMAL', 'FUNNY'])
```

## Estilos Aplicados

Todos os componentes usam:
- **Inline styles** para máxima portabilidade
- **CSS-in-JS** com variáveis de cor Nocturne
- **Responsive design** com flexbox/grid
- **Smooth transitions** em hover states
- **Accessibility** com labels e inputs semânticos

## Melhorias Futuras

1. Paginação na lista de agentes (se houver muitos)
2. Busca/filtro de agentes
3. Bulk actions (deletar múltiplos)
4. Export de configurações de agentes
5. Templates de agentes pré-configurados
6. Histórico de edições
7. Teste de agente (preview do comportamento)
8. Analytics por agente

## Troubleshooting

### Componentes não aparecem
- Verifique se os arquivos estão em `frontend/src/components/`
- Confirme imports no Dashboard.tsx

### Erros de autenticação (401)
- Verifique se o token está sendo passado corretamente
- Confirme que `useAuthStore()` retorna um token válido

### Endpoints retornam 404
- Verifique se o backend está rodando em localhost:3000
- Confirme os nomes das rotas no backend

### Dropdown (select) vazios
- Verifique se os endpoints `/agents/meta/roles` e `/agents/meta/tones` estão funcionando
- Confira se retornam arrays de strings

## Notas Técnicas

- Componentes usam **React Hooks** (useState, useEffect)
- Sem dependências externas de UI (CSS-in-JS puro)
- Compatível com qualquer versão recente do React
- TypeScript interfaces para type safety
- Zustand para gerenciamento de estado de autenticação

## Autor

Implementação: Claude Code
Data: 2026-08-11
Design System: Nocturne
