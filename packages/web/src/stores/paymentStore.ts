import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Payment {
  id: string
  patientName: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  method: 'card' | 'cash' | 'transfer'
  date: string
  description: string
}

interface PaymentState {
  payments: Payment[]
  add: (p: Omit<Payment, 'id' | 'status' | 'date'>) => void
  remove: (id: string) => void
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      payments: [
        { id: 'p1', patientName: 'John Doe', amount: 1500, currency: 'UYU', status: 'succeeded', method: 'cash', date: '2025-04-20', description: 'Sesión individual' },
        { id: 'p2', patientName: 'Alice Smith', amount: 1500, currency: 'UYU', status: 'pending', method: 'transfer', date: '2025-04-21', description: 'Sesión individual' },
        { id: 'p3', patientName: 'Michael Brown', amount: 2000, currency: 'UYU', status: 'failed', method: 'card', date: '2025-04-18', description: 'Sesión pareja' },
        { id: 'p4', patientName: 'Sarah Johnson', amount: 1500, currency: 'UYU', status: 'succeeded', method: 'cash', date: '2025-04-19', description: 'Sesión individual' },
      ],
      add: (p) =>
        set((state) => ({
          payments: [
            { ...p, id: `pi_${Math.random().toString(36).slice(2, 8)}`, status: p.method === 'card' ? 'pending' : 'succeeded', date: new Date().toISOString().split('T')[0] },
            ...state.payments,
          ],
        })),
      remove: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),
    }),
    { name: 'psyapp-payments' }
  )
)
