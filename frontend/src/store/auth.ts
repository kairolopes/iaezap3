import { create } from 'zustand'
import api from '../api/client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  companyId?: string | null
}

interface AuthStore {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  checkAuth: () => void
}

const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  user: getInitialUser(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ token, user, isLoading: false, error: null })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.'
      set({ isLoading: false, error: errorMessage })
      throw new Error(errorMessage)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, error: null })
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },

  checkAuth: () => {
    const token = localStorage.getItem('token')
    const user = getInitialUser()
    set({ token, user })
  },
}))
