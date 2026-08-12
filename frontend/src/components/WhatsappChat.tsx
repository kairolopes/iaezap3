import { useState, useEffect, useRef } from 'react'

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

interface WhatsappChatProps {
  conversation: Conversation
  messages: Message[]
  loading: boolean
  onSendMessage: (text: string) => Promise<void>
  formatTime: (date: string) => string
}

export function WhatsappChat({
  conversation,
  messages,
  loading,
  onSendMessage,
  formatTime,
}: WhatsappChatProps) {
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim() || sending) return

    const text = messageText
    setMessageText('')
    setSending(true)

    try {
      await onSendMessage(text)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#161826',
        borderRadius: '0 8px 8px 0',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #292b31',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#131523',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 4px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#e9e9ed',
            }}
          >
            {conversation.contact_name || 'Sem nome'}
          </h3>
          <p
            style={{
              margin: '0',
              fontSize: '13px',
              color: '#9397ab',
            }}
          >
            {conversation.contact_phone}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              background:
                conversation.status === 'active'
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(107, 114, 128, 0.1)',
              color:
                conversation.status === 'active' ? '#86efac' : '#d1d5db',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            {conversation.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#75798c',
              fontSize: '14px',
            }}
          >
            Carregando mensagens...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#75798c',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.is_outgoing ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '60%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: message.is_outgoing
                    ? '#9184d9'
                    : '#1d1f2e',
                  border: message.is_outgoing
                    ? 'none'
                    : '1px solid #292b31',
                  color: message.is_outgoing ? '#ffffff' : '#e9e9ed',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                  }}
                >
                  {message.text}
                </p>
                <p
                  style={{
                    margin: '0',
                    fontSize: '11px',
                    opacity: 0.7,
                    textAlign: 'right',
                  }}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #292b31',
          background: '#131523',
          borderRadius: '0 0 8px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: '#1d1f2e',
              border: '1px solid #292b31',
              borderRadius: '8px',
              color: '#e9e9ed',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '100px',
              outline: 'none',
              opacity: sending ? 0.6 : 1,
              cursor: sending ? 'not-allowed' : 'text',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            style={{
              padding: '10px 20px',
              background:
                messageText.trim() && !sending ? '#9184d9' : '#555566',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor:
                messageText.trim() && !sending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: messageText.trim() && !sending ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (messageText.trim() && !sending) {
                e.currentTarget.style.background = '#a89ae3'
              }
            }}
            onMouseLeave={(e) => {
              if (messageText.trim() && !sending) {
                e.currentTarget.style.background = '#9184d9'
              }
            }}
          >
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
