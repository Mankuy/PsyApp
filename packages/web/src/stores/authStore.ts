import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/login/psychologist', { email, password })
          const meRes = await api.get('/auth/me')
          set({ user: meRes.data.user, isAuthenticated: true, isLoading: false })
          return true
        } catch (err: any) {
          set({
            error: err.response?.data?.message || 'Error al iniciar sesión',
            isLoading: false,
            isAuthenticated: false,
          })
          return false
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/register/psychologist', { name, email, password })
          const meRes = await api.get('/auth/me')
          set({ user: meRes.data.user, isAuthenticated: true, isLoading: false })
          return true
        } catch (err: any) {
          set({
            error: err.response?.data?.message || 'Error al registrarse',
            isLoading: false,
            isAuthenticated: false,
          })
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post('/auth/logout')
        } catch {}
        set({ user: null, isAuthenticated: false, isLoading: false, error: null })
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const res = await api.get('/auth/me')
          const user = res.data.user
          // Only authenticate if role is professional/psychologist
          if (user?.role !== 'patient') {
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'psyapp-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
