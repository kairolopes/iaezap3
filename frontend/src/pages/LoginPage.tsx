import { useState } from 'react'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
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
        <h1 style={{ margin: '0 0 30px', fontSize: '28px', color: '#e9e9ed' }}>IAEZAP</h1>

        {error && <div style={{ color: '#ff6b6b', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#b2b6ca', fontSize: '12px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #3f424d',
              borderRadius: '8px',
              background: '#161826',
              color: '#e9e9ed',
              fontSize: '14px',
              boxSizing: 'border-box',
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
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #3f424d',
              borderRadius: '8px',
              background: '#161826',
              color: '#e9e9ed',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: '1px solid #9184d9',
          color: '#d2cefd',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '8px',
          cursor: 'pointer',
        }}>
          Entrar
        </button>
      </form>
    </div>
  )
}
