import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface RamadanState {
  startDate: string
  theme: ThemeMode
  setStartDate: (value: string) => void
  toggleTheme: () => void
}

export const useRamadanStore = create<RamadanState>((set) => ({
  startDate: '2025-03-11',
  theme: 'light',
  setStartDate: (value) => set({ startDate: value }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
