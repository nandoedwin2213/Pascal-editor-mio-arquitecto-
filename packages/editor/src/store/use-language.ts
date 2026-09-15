'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'es' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'es',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'quinde-language',
    },
  ),
)
