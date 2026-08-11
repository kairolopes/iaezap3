import { useState } from 'react'
import { useAuthStore } from '../store/auth'

interface LoginPageProps {
  onSwitchToRegister: () => void
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // The App component will automatically redirect when token is set
    } catch {
      // Error is handled by store
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#161826',
    }}>
      <form onSubmit={handleLogin} style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        background: '#1d1f2e',
        borderRadius: '12px',
        border: '1px solid #3f424d',
      }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '28px', color: '#e9e9ed' }}>IAEZAP</h1>
        <p style={{ margin: '0 0 30px', color: '#b2b6ca', fontSize: '12px' }}>
          Plataforma de IA para WhatsApp Business
        </p>

        {error && (
          <div style={{
            background: '#5f3d3d',
            border: '1px solid #ff6b6b',
            color: '#ff9999',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '12px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#b2b6ca', fontSize: '12px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #3f424d',
              borderRadius: '8px',
              background: '#161826',
              color: '#e9e9ed',
              fontSize: '14px',
              boxSizing: 'border-box',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
            placeholder="seu@email.com"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#b2b6ca', fontSize: '12px' }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #3f424d',
              borderRadius: '8px',
              background: '#161826',
              color: '#e9e9ed',
              fontSize: '14px',
              boxSizing: 'border-box',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: isLoading ? '#3f424d' : 'transparent',
            border: '1px solid #9184d9',
            color: '#d2cefd',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#75798c',
        }}>
          Não tem conta?{' '}
          <span
            onClick={onSwitchToRegister}
            style={{ color: '#9184d9', cursor: 'pointer', fontWeight: '500' }}
          >
            Criar conta
          </span>
        </div>
      </form>
    </div>
  )
}
