import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

interface Conversation {
  id: string
  contact_phone: string
  contact_name: string
  status: string
  last_message: string
  last_message_at: string
  message_count: number
}

export function ConversationList() {
  const { user, token } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const companyId = user?.companyId

  useEffect(() => {
    if (companyId) {
      fetchConversations()
    }
  }, [companyId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/conversations/${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar conversas')
      const data = await response.json()
      setConversations(Array.isArray(data) ? data : [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar conversas')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
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
          Conversas Recentes
        </h2>
        <button
          onClick={fetchConversations}
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
          🔄 Atualizar
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
          Carregando conversas...
        </div>
      ) : conversations.length === 0 ? (
        <div style={{
          background: '#1d1f2e',
          border: '1px solid #292b31',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#75798c',
        }}>
          Nenhuma conversa ainda. Aguardando primeira mensagem no WhatsApp...
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              style={{
                background: '#1d1f2e',
                border: '1px solid #292b31',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#e9e9ed',
                  }}>
                    {conversation.contact_name || 'Sem nome'}
                  </h3>
                  <span style={{
                    fontSize: '13px',
                    color: '#9397ab',
                  }}>
                    {conversation.contact_phone}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    background: conversation.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: conversation.status === 'active' ? '#86efac' : '#d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                  }}>
                    {conversation.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p style={{
                  margin: '0',
                  fontSize: '13px',
                  color: '#9397ab',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical' as any,
                }}>
                  {conversation.last_message || 'Sem mensagens'}
                </p>
              </div>
              <div style={{
                textAlign: 'right',
                marginLeft: '16px',
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#9397ab',
                  marginBottom: '4px',
                }}>
                  {formatTime(conversation.last_message_at)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#d2cefd',
                  fontWeight: '500',
                }}>
                  {conversation.message_count} mensagens
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
