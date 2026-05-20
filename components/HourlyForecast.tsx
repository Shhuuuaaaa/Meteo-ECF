'use client'

import { motion } from 'framer-motion'
import { WeatherIcon } from './WeatherIcon'
import { useUnitStore } from '@/lib/useUnitStore'
import { tempRaw } from '@/lib/units'
import type { HourlyWeather } from '@/lib/weatherData'

interface HourlyForecastProps {
  hourly: HourlyWeather[]
  currentHourIndex?: number
}

export function HourlyForecast({ hourly, currentHourIndex = 3 }: HourlyForecastProps) {
  const { unit } = useUnitStore()

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-5">
      <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4 px-1">
        Prévisions horaires
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-flat pb-2">
        {hourly.map((hour, i) => {
          const isActive = i === currentHourIndex
          return (
            <motion.div
              key={`${hour.time}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.025 }}
              className={`flex flex-col items-center gap-2.5 px-4 py-3.5 rounded-2xl min-w-[66px] shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 border border-white/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/45'}`}>
                {hour.time}
              </span>
              <WeatherIcon condition={hour.condition} size={20} />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
                {tempRaw(hour.temp, unit)}°
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
