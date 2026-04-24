import { create } from 'zustand'

interface LangState {
  lang: 'es' | 'en'
  setLang: (value: 'es' | 'en') => void
  toggleLang: () => void
}

export const useLangStore = create<LangState>((set) => ({
  lang: 'es',
  setLang: (value) => set({ lang: value }),
  toggleLang: () => set((state) => ({ lang: state.lang === 'es' ? 'en' : 'es' })),
}))
