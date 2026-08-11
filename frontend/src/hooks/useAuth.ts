import { useAuthStore } from '../store/auth'

/**
 * Hook customizado para usar o store de autenticação
 * Fornece uma interface mais limpa para acessar dados e funções de auth
 */
export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const setUser = useAuthStore((state) => state.setUser)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  const isAuthenticated = !!token && !!user

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    setUser,
    checkAuth,
  }
}
