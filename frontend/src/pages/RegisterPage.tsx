import { useState } from 'react'
import { useAuthStore } from '../store/auth'

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Senhas não correspondem')
      return
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Erro ao registrar')
        return
      }

      // Auto login after registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (loginResponse.ok) {
        const data = await loginResponse.json()
        useAuthStore.setState({ token: data.access_token, user: data.user })
      }
    } catch (err) {
      setError('Erro ao registrar. Tente novamente.')
    } finally {
      setIsLoading(false)
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
      <form onSubmit={handleRegister} style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        background: '#1d1f2e',
        borderRadius: '12px',
        border: '1px solid #3f424d',
      }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '28px', color: '#e9e9ed' }}>Criar Conta</h1>
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
          <label style={{ display: 'block', marginBottom: '8px', color: '#b2b6ca', fontSize: '12px' }}>Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            }}
            placeholder="Seu nome completo"
          />
        </div>

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
            }}
            placeholder="seu@email.com"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
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
            }}
            placeholder="••••••••"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#b2b6ca', fontSize: '12px' }}>Confirmar Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          }}
        >
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#75798c',
        }}>
          Já tem conta?{' '}
          <span
            onClick={onSwitchToLogin}
            style={{ color: '#9184d9', cursor: 'pointer', fontWeight: '500' }}
          >
            Fazer login
          </span>
        </div>
      </form>
    </div>
  )
}
