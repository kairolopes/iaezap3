import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

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

interface AgentFormProps {
  agent?: Agent | null
  onClose: () => void
  onSuccess: () => void
}

export function AgentForm({ agent, onClose, onSuccess }: AgentFormProps) {
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [tones, setTones] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: agent?.name || '',
    role: agent?.role || 'SALES',
    personality: agent?.personality || '',
    tone: agent?.tone || 'FRIENDLY',
    instructions: agent?.instructions || '',
    canRespond24h: agent?.can_respond_24h || false,
    canCreateOrder: agent?.can_create_order || false,
    canSchedule: agent?.can_schedule || false,
    maxDiscount: agent?.max_discount || 0,
  })

  const companyId = user?.companyId

  useEffect(() => {
    fetchMetadata()
  }, [])

  const fetchMetadata = async () => {
    try {
      const [rolesRes, tonesRes] = await Promise.all([
        fetch('http://localhost:3000/agents/meta/roles', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:3000/agents/meta/tones', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      if (rolesRes.ok) setRoles(await rolesRes.json())
      if (tonesRes.ok) setTones(await tonesRes.json())
    } catch (err) {
      console.error('Erro ao buscar metadata:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório')
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        personality: formData.personality,
        tone: formData.tone,
        instructions: formData.instructions,
        canRespond24h: formData.canRespond24h,
        canCreateOrder: formData.canCreateOrder,
        canSchedule: formData.canSchedule,
        maxDiscount: formData.maxDiscount,
      }

      const isUpdate = !!agent
      const url = isUpdate
        ? `http://localhost:3000/agents/${agent.id}`
        : `http://localhost:3000/agents/${companyId}`

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar agente')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar agente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1d1f2e',
        border: '1px solid #292b31',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #292b31',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#161826',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#e9e9ed',
          }}>
            {agent ? 'Editar Agente' : 'Criar Novo Agente'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9397ab',
              fontSize: '20px',
              cursor: 'pointer',
              padding: 0,
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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

          {/* Nome */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Nome do Agente *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ex: Assistente de Vendas"
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#423a6a'}
              onBlur={(e) => e.target.style.borderColor = '#292b31'}
            />
          </div>

          {/* Função */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Função *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Personalidade */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Personalidade
            </label>
            <input
              type="text"
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              placeholder="ex: Amigável, profissional, entusiasta"
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#423a6a'}
              onBlur={(e) => e.target.style.borderColor = '#292b31'}
            />
          </div>

          {/* Tom */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Tom de Voz *
            </label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>

          {/* Instruções */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Instruções e Comportamento
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Descreva como o agente deve se comportar, suas regras e diretrizes..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              onFocus={(e) => e.target.style.borderColor = '#423a6a'}
              onBlur={(e) => e.target.style.borderColor = '#292b31'}
            />
          </div>

          {/* Desconto Máximo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Desconto Máximo (%)
            </label>
            <input
              type="number"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleChange}
              min="0"
              max="100"
              style={{
                width: '100%',
                padding: '12px',
                background: '#131523',
                border: '1px solid #292b31',
                borderRadius: '8px',
                color: '#e9e9ed',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#423a6a'}
              onBlur={(e) => e.target.style.borderColor = '#292b31'}
            />
          </div>

          {/* Checkboxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <input
                type="checkbox"
                id="canRespond24h"
                name="canRespond24h"
                checked={formData.canRespond24h}
                onChange={handleChange}
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  accentColor: '#9184d9',
                }}
              />
              <label
                htmlFor="canRespond24h"
                style={{
                  color: '#c5c7d0',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Responder 24h
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <input
                type="checkbox"
                id="canCreateOrder"
                name="canCreateOrder"
                checked={formData.canCreateOrder}
                onChange={handleChange}
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  accentColor: '#9184d9',
                }}
              />
              <label
                htmlFor="canCreateOrder"
                style={{
                  color: '#c5c7d0',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Criar Pedidos
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <input
                type="checkbox"
                id="canSchedule"
                name="canSchedule"
                checked={formData.canSchedule}
                onChange={handleChange}
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  accentColor: '#9184d9',
                }}
              />
              <label
                htmlFor="canSchedule"
                style={{
                  color: '#c5c7d0',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Agendar
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #292b31',
            paddingTop: '20px',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid #423a6a',
                color: '#d2cefd',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid #9184d9',
                color: '#d2cefd',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'rgba(145, 132, 217, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {loading ? 'Salvando...' : 'Salvar Agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
