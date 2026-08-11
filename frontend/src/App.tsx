import { useEffect, useState } from 'react'
import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'

export function App() {
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    setLoading(false)
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>
  }

  return token && user ? <Dashboard /> : <LoginPage />
}
