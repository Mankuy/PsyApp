import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AvailabilityRule {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
}

interface OnboardingState {
  completed: boolean
  practiceName: string
  defaultSessionDuration: number
  availabilityRules: AvailabilityRule[]
  setPracticeName: (name: string) => void
  setDefaultSessionDuration: (minutes: number) => void
  setAvailabilityRules: (rules: AvailabilityRule[]) => void
  addAvailabilityRule: (rule: AvailabilityRule) => void
  removeAvailabilityRule: (index: number) => void
  complete: () => void
  reset: () => void
}

const defaultRules: AvailabilityRule[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotDuration: 60 },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotDuration: 60 },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', slotDuration: 60 },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', slotDuration: 60 },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', slotDuration: 60 },
]

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      practiceName: '',
      defaultSessionDuration: 60,
      availabilityRules: defaultRules,

      setPracticeName: (name) => set({ practiceName: name }),
      setDefaultSessionDuration: (minutes) => set({ defaultSessionDuration: minutes }),
      setAvailabilityRules: (rules) => set({ availabilityRules: rules }),
      addAvailabilityRule: (rule) =>
        set((state) => ({ availabilityRules: [...state.availabilityRules, rule] })),
      removeAvailabilityRule: (index) =>
        set((state) => ({
          availabilityRules: state.availabilityRules.filter((_, i) => i !== index),
        })),
      complete: () => set({ completed: true }),
      reset: () =>
        set({
          completed: false,
          practiceName: '',
          defaultSessionDuration: 60,
          availabilityRules: defaultRules,
        }),
    }),
    {
      name: 'psyapp-onboarding',
    }
  )
)
