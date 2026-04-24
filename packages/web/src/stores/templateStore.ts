import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CustomTemplate {
  id: string
  name: string
  nameEn: string
  bodyEs: string
  bodyEn: string
}

interface TemplateState {
  customTemplates: CustomTemplate[]
  addTemplate: (t: Omit<CustomTemplate, 'id'>) => void
  removeTemplate: (id: string) => void
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      customTemplates: [],
      addTemplate: (t) =>
        set((state) => ({
          customTemplates: [
            ...state.customTemplates,
            { ...t, id: Math.random().toString(36).slice(2) },
          ],
        })),
      removeTemplate: (id) =>
        set((state) => ({
          customTemplates: state.customTemplates.filter((c) => c.id !== id),
        })),
    }),
    { name: 'psyapp-templates' }
  )
)
