import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Integration {
  id: string
  name: string
  nameEs: string
  connected: boolean
  type: 'whatsapp' | 'email' | 'calendar'
}

interface IntegrationState {
  integrations: Integration[]
  connect: (id: string) => void
  disconnect: (id: string) => void
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      integrations: [
        { id: 'whatsapp', name: 'WhatsApp Business', nameEs: 'WhatsApp Business', connected: false, type: 'whatsapp' },
        { id: 'email', name: 'SendGrid', nameEs: 'SendGrid', connected: false, type: 'email' },
        { id: 'calendar', name: 'Google Calendar', nameEs: 'Google Calendar', connected: false, type: 'calendar' },
      ],
      connect: (id) => set((state) => ({
        integrations: state.integrations.map((i) => i.id === id ? { ...i, connected: true } : i)
      })),
      disconnect: (id) => set((state) => ({
        integrations: state.integrations.map((i) => i.id === id ? { ...i, connected: false } : i)
      })),
    }),
    { name: 'psyapp-integrations' }
  )
)
