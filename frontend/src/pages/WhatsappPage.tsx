import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { WhatsappChat } from '../components/WhatsappChat'

interface Conversation {
  id: string
  contact_phone: string
  contact_name: string
  status: string
  last_message: string
  last_message_at: string
  message_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender: string
  text: string
  created_at: string
  is_outgoing: boolean
}

export function WhatsappPage() {
  const { user, token } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageLoading, setMessageLoading] = useState(false)

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
        `/api/z-api/conversations/${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar conversas')
      const data = await response.json()
      const conversationsList = Array.isArray(data) ? data : []
      setConversations(conversationsList)
      setError('')

      if (conversationsList.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsList[0])
        fetchMessages(conversationsList[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar conversas')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessageLoading(true)
      const response = await fetch(
        `/api/z-api/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar mensagens')
      const data = await response.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message)
    } finally {
      setMessageLoading(false)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim()) return

    try {
      const response = await fetch(
        `/api/z-api/conversations/${selectedConversation.id}/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
          }),
        }
      )

      if (!response.ok) throw new Error('Erro ao enviar mensagem')

      await fetchMessages(selectedConversation.id)
      await fetchConversations()
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err.message)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact_phone.includes(searchQuery)
  )

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()

    if (isToday) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' })
  }

  const formatTimeFull = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 160px)',
      gap: '0',
      background: '#161826',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Left Panel - Conversation List */}
      <div style={{
        width: '360px',
        background: '#131523',
        borderRight: '1px solid #292b31',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px 0 0 8px',
      }}>
        {/* Search Bar */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #292b31',
        }}>
          <input
            type="text"
            placeholder="Pesquisar conversa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1d1f2e',
              border: '1px solid #292b31',
              borderRadius: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Conversation List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
        }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '13px',
              margin: '8px',
              borderRadius: '6px',
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#75798c',
              fontSize: '14px',
            }}>
              Carregando conversas...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#75798c',
              fontSize: '14px',
            }}>
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                style={{
                  padding: '12px 8px',
                  borderBottom: '1px solid #292b31',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conversation.id ? '#1d1f2e' : 'transparent',
                  borderLeft: selectedConversation?.id === conversation.id ? '4px solid #9184d9' : '4px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.currentTarget.style.background = '#1a1c27'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}>
                  <div>
                    <h4 style={{
                      margin: '0',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#e9e9ed',
                    }}>
                      {conversation.contact_name || 'Sem nome'}
                    </h4>
                    <p style={{
                      margin: '2px 0 0',
                      fontSize: '12px',
                      color: '#9397ab',
                    }}>
                      {conversation.contact_phone}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9397ab',
                  }}>
                    {formatTime(conversation.last_message_at)}
                  </div>
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
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      {selectedConversation ? (
        <WhatsappChat
          conversation={selectedConversation}
          messages={messages}
          loading={messageLoading}
          onSendMessage={handleSendMessage}
          formatTime={formatTimeFull}
        />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#75798c',
          fontSize: '16px',
          borderRadius: '0 8px 8px 0',
        }}>
          Selecione uma conversa para começar
        </div>
      )}
    </div>
  )
}
