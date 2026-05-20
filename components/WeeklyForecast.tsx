'use client'

import { motion } from 'framer-motion'
import { WeatherIcon } from './WeatherIcon'
import { useUnitStore } from '@/lib/useUnitStore'
import { tempRaw } from '@/lib/units'
import type { DailyWeather } from '@/lib/weatherData'

interface WeeklyForecastProps {
  weekly: DailyWeather[]
}

export function WeeklyForecast({ weekly }: WeeklyForecastProps) {
  const { unit } = useUnitStore()

  const allTemps = weekly.flatMap((d) => [
    tempRaw(d.high, unit),
    tempRaw(d.low, unit),
  ])
  const minTemp = Math.min(...allTemps)
  const maxTemp = Math.max(...allTemps)
  const range   = maxTemp - minTemp || 1

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6">
      <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
        Prévisions 7 jours
      </p>
      <div className="flex flex-col">
        {weekly.map((day, i) => {
          const low  = tempRaw(day.low, unit)
          const high = tempRaw(day.high, unit)
          const lowPct  = ((low - minTemp) / range) * 100
          const highPct = ((high - minTemp) / range) * 100

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
            >
              <span className="text-white/60 text-sm w-24 shrink-0 font-light">
                {day.day}
              </span>
              <WeatherIcon condition={day.condition} size={18} className="shrink-0" />
              <span className="text-white/40 text-sm w-8 text-right shrink-0 font-light">
                {low}°
              </span>
              <div className="flex-1 h-1 rounded-full bg-white/10 relative mx-1">
                <motion.div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    left: `${lowPct}%`,
                    width: `${highPct - lowPct}%`,
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <span className="text-white text-sm w-8 shrink-0 font-medium">
                {high}°
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
