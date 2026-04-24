import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface PatientAuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      login: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/patient/magic-link', { email })
          const meRes = await api.get('/auth/me')
          set({ user: meRes.data.user, isAuthenticated: true, isLoading: false })
          return true
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Error', isLoading: false, isAuthenticated: false })
          return false
        }
      },
      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        set({ user: null, isAuthenticated: false, isLoading: false, error: null })
      },
      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const res = await api.get('/auth/me')
          const user = res.data.user
          // Only authenticate if role is patient
          if (user?.role === 'patient') {
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    { name: 'psyapp-patient-auth', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)
