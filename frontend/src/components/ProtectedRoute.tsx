import { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

/**
 * Componente para proteger rotas que requerem autenticação
 *
 * @example
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#ff6b6b',
      }}>
        Você precisa estar autenticado para acessar esta página.
      </div>
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#ff6b6b',
      }}>
        Você não tem permissão para acessar esta página.
      </div>
    )
  }

  return <>{children}</>
}
