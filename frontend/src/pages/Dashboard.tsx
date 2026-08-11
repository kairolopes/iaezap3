import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { AgentList } from '../components/AgentList'

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('conversations')

  const navItems = [
    { id: 'conversations', label: 'Conversas' },
    { id: 'agents', label: 'Agentes' },
    { id: 'products', label: 'Produtos' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Configurações' },
  ]

  const getHeaderTitle = () => {
    const item = navItems.find(i => i.id === activeTab)
    return item?.label || 'Dashboard'
  }

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
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: 'auto',
      }}>
        <h2 style={{ margin: '0 0 30px', fontSize: '16px', fontWeight: '600' }}>IAEZAP</h2>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((tab) => (
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(145,132,217,.05)'
                  e.currentTarget.style.color = '#b1c5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#9397ab'
                }
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
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'
              e.currentTarget.style.borderColor = '#ef4444'
              e.currentTarget.style.color = '#fca5a5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#3f424d'
              e.currentTarget.style.color = '#cfd3e5'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '220px' }}>
        <header style={{
          padding: '20px 30px',
          borderBottom: '1px solid #292b31',
          background: '#161826',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <h1 style={{ margin: '0', fontSize: '20px', fontWeight: '500' }}>
            {getHeaderTitle()}
          </h1>
        </header>

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {/* Conversas */}
          {activeTab === 'conversations' && (
            <div>
              <div style={{
                background: '#1d1f2e',
                border: '1px solid #292b31',
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#75798c',
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Nenhuma conversa ainda. Aguardando primeira mensagem no WhatsApp...
                </p>
              </div>
            </div>
          )}

          {/* Agentes */}
          {activeTab === 'agents' && (
            <AgentList />
          )}

          {/* Produtos */}
          {activeTab === 'products' && (
            <div style={{
              background: '#1d1f2e',
              border: '1px solid #292b31',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#75798c',
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Recurso de catálogo em desenvolvimento...
              </p>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div style={{
              background: '#1d1f2e',
              border: '1px solid #292b31',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#75798c',
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Analytics em desenvolvimento...
              </p>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div style={{
              background: '#1d1f2e',
              border: '1px solid #292b31',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#75798c',
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Configurações em desenvolvimento...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
