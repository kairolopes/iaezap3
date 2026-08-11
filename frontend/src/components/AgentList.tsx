import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { AgentForm } from './AgentForm'

interface Agent {
  id: string
  name: string
  role: string
  personality: string
  tone: string
  instructions: string
  is_active: boolean
  can_respond_24h: boolean
  can_create_order: boolean
  can_schedule: boolean
  max_discount: number
}

export function AgentList() {
  const { user, token } = useAuthStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const companyId = user?.companyId

  useEffect(() => {
    if (companyId) {
      fetchAgents()
    }
  }, [companyId])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:3000/agents/${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar agentes')
      const data = await response.json()
      setAgents(Array.isArray(data) ? data : [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar agentes')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (agentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este agente?')) return

    try {
      const response = await fetch(
        `http://localhost:3000/agents/${agentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao deletar agente')
      setAgents(agents.filter(a => a.id !== agentId))
    } catch (err: any) {
      alert('Erro ao deletar agente: ' + err.message)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAgent(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    fetchAgents()
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setShowForm(true)
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '12px',
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#e9e9ed' }}>
          Agentes de IA
        </h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid #9184d9',
            color: '#d2cefd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(145, 132, 217, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ➕ Criar novo agente
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#fca5a5',
          marginBottom: '20px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#75798c',
        }}>
          Carregando agentes...
        </div>
      ) : agents.length === 0 ? (
        <div style={{
          background: '#1d1f2e',
          border: '1px solid #292b31',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#75798c',
        }}>
          Nenhum agente criado ainda. Crie o primeiro para começar!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '16px',
        }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{
                background: '#1d1f2e',
                border: '1px solid #292b31',
                borderRadius: '8px',
                padding: '20px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#242637'
                e.currentTarget.style.borderColor = '#423a6a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1d1f2e'
                e.currentTarget.style.borderColor = '#292b31'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#e9e9ed',
                    flex: 1,
                  }}>
                    {agent.name}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    background: agent.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: agent.is_active ? '#86efac' : '#d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                  }}>
                    {agent.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '13px',
                }}>
                  <div>
                    <span style={{ color: '#9397ab', display: 'block', marginBottom: '4px' }}>
                      Função
                    </span>
                    <span style={{ color: '#e9e9ed' }}>{agent.role}</span>
                  </div>
                  <div>
                    <span style={{ color: '#9397ab', display: 'block', marginBottom: '4px' }}>
                      Tom
                    </span>
                    <span style={{ color: '#e9e9ed' }}>{agent.tone}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#9397ab', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                    Personalidade
                  </span>
                  <span style={{ color: '#e9e9ed', fontSize: '14px' }}>{agent.personality}</span>
                </div>

                {agent.instructions && (
                  <div>
                    <span style={{ color: '#9397ab', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                      Instruções
                    </span>
                    <p style={{
                      color: '#c5c7d0',
                      fontSize: '13px',
                      margin: '0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {agent.instructions}
                    </p>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid #292b31',
                paddingTop: '12px',
              }}>
                <button
                  onClick={() => handleEdit(agent)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid #423a6a',
                    color: '#d2cefd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(145, 132, 217, 0.1)'
                    e.currentTarget.style.borderColor = '#9184d9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#423a6a'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid #5f2f2f',
                    color: '#fca5a5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.borderColor = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#5f2f2f'
                  }}
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AgentForm
          agent={editingAgent}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
