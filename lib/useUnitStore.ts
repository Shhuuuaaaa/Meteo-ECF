import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Unit } from './units'

interface UnitStore {
  unit: Unit
  toggle: () => void
}

export const useUnitStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      unit: 'metric',
      toggle: () => set({ unit: get().unit === 'metric' ? 'imperial' : 'metric' }),
    }),
    { name: 'meteo-unit' }
  )
)
