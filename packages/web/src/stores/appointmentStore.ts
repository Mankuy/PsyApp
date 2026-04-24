import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Appointment {
  id: string
  patientName: string
  professional: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string
  videoLink?: string
}

interface AppointmentState {
  appointments: Appointment[]
  add: (a: Omit<Appointment, 'id' | 'status'>) => void
  update: (id: string, a: Partial<Appointment>) => void
  remove: (id: string) => void
  complete: (id: string) => void
  cancel: (id: string) => void
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      appointments: [
        { id: '1', patientName: 'John Doe', professional: 'Dr. Smith', date: '2025-04-23', time: '09:00', duration: 60, status: 'scheduled', notes: '', videoLink: 'https://meet.jit.si/psyapp-demo-1' },
        { id: '2', patientName: 'Alice Smith', professional: 'Dr. Brown', date: '2025-04-23', time: '11:00', duration: 45, status: 'scheduled', notes: '', videoLink: 'https://meet.jit.si/psyapp-demo-2' },
        { id: '3', patientName: 'Michael Brown', professional: 'Dr. Smith', date: '2025-04-24', time: '14:00', duration: 60, status: 'scheduled', notes: '', videoLink: 'https://meet.jit.si/psyapp-demo-3' },
        { id: '4', patientName: 'Sarah Johnson', professional: 'Dr. Lee', date: '2025-04-22', time: '10:00', duration: 30, status: 'completed', notes: '', videoLink: 'https://meet.jit.si/psyapp-demo-4' },
      ],
      add: (a) =>
        set((state) => ({
          appointments: [
            { ...a, id: Math.random().toString(36).slice(2), status: 'scheduled' },
            ...state.appointments,
          ],
        })),
      update: (id, a) =>
        set((state) => ({
          appointments: state.appointments.map((ap) => (ap.id === id ? { ...ap, ...a } : ap)),
        })),
      remove: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((ap) => ap.id !== id),
        })),
      complete: (id) =>
        set((state) => ({
          appointments: state.appointments.map((ap) => (ap.id === id ? { ...ap, status: 'completed' as const } : ap)),
        })),
      cancel: (id) =>
        set((state) => ({
          appointments: state.appointments.map((ap) => (ap.id === id ? { ...ap, status: 'cancelled' as const } : ap)),
        })),
    }),
    { name: 'psyapp-appointments' }
  )
)
