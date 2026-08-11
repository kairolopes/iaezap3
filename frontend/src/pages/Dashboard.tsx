import { useState } from 'react'
import { useAuthStore } from '../store/auth'

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('conversations')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#161826', color: '#e9e9ed' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        background: '#131523',
        borderRight: '1px solid #292b31',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{ margin: '0 0 30px', fontSize: '16px', fontWeight: '600' }}>IAEZAP</h2>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'conversations', label: 'Conversas' },
            { id: 'agents', label: 'Agentes' },
            { id: 'products', label: 'Produtos' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'settings', label: 'Configurações' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px',
                border: activeTab === tab.id ? '1px solid #423a6a' : '1px solid transparent',
                background: activeTab === tab.id ? 'rgba(145,132,217,.13)' : 'transparent',
                color: activeTab === tab.id ? '#e7e5fe' : '#9397ab',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #292b31', paddingTop: '15px' }}>
          <div style={{ fontSize: '12px', marginBottom: '10px' }}>
            <div style={{ fontWeight: '500', color: '#e4e7f5' }}>{user?.name}</div>
            <div style={{ color: '#75798c', fontSize: '11px' }}>{user?.email}</div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid #3f424d',
              color: '#cfd3e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: '20px 30px',
          borderBottom: '1px solid #292b31',
          background: '#161826',
        }}>
          <h1 style={{ margin: '0', fontSize: '20px', fontWeight: '500' }}>
            {activeTab === 'conversations' && 'Conversas'}
            {activeTab === 'agents' && 'Agentes de IA'}
            {activeTab === 'products' && 'Catálogo de Produtos'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Configurações'}
          </h1>
        </header>

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {activeTab === 'conversations' && (
            <div>
              <h2 style={{ marginTop: '0' }}>Conversas recentes</h2>
              <div style={{
                background: '#1d1f2e',
                border: '1px solid #292b31',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#75798c',
              }}>
                Nenhuma conversa ainda. Aguardando primeira mensagem no WhatsApp...
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div>
              <h2 style={{ marginTop: '0', marginBottom: '20px' }}>Seus agentes de IA</h2>
              <div style={{
                background: '#1d1f2e',
                border: '1px solid #292b31',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#75798c',
              }}>
                Nenhum agente criado. Crie o primeiro agente para começar.
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <button style={{
              marginTop: '20px',
              padding: '12px 20px',
              background: 'transparent',
              border: '1px solid #9184d9',
              color: '#d2cefd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}>
              ➕ Criar novo agente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
