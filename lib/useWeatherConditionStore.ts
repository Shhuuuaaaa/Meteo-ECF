import { create } from 'zustand'
import type { WeatherCondition } from './weatherData'

interface WeatherConditionStore {
  condition: WeatherCondition
  isDay: boolean
  temperature: number
  setCondition: (condition: WeatherCondition, isDay: boolean, temperature: number) => void
}

export const useWeatherConditionStore = create<WeatherConditionStore>()((set) => ({
  condition: 'partly-cloudy',
  isDay: true,
  temperature: 20,
  setCondition: (condition, isDay, temperature) => set({ condition, isDay, temperature }),
}))
