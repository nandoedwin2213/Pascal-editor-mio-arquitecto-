'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'es' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

// The stored preference is applied after mount (see `useLanguageHydration`), so the
// first client render matches the server-rendered Spanish default.
export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'es',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'quinde-language',
      skipHydration: true,
    },
  ),
)

export function useLanguageHydration(): Language {
  const language = useLanguage((state) => state.language)

  useEffect(() => {
    void useLanguage.persist.rehydrate()
  }, [])

  return language
}
