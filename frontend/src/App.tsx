import { useEffect, useState } from 'react'
import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'

export function App() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const [page, setPage] = useState<'login' | 'register'>('login')

  useEffect(() => {
    // Check authentication on app load
    checkAuth()
  }, [checkAuth])

  if (!token || !user) {
    if (page === 'register') {
      return <RegisterPage onSwitchToLogin={() => setPage('login')} />
    }
    return <LoginPage onSwitchToRegister={() => setPage('register')} />
  }

  return <Dashboard />
}
