'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Thermometer, Star, Clock } from 'lucide-react'
import { WeatherIcon } from './WeatherIcon'
import { useFavoritesStore } from '@/lib/useFavoritesStore'
import { useUnitStore } from '@/lib/useUnitStore'
import { tempDisplay, tempRaw } from '@/lib/units'
import type { WeatherData } from '@/lib/weatherData'

interface WeatherCardProps {
  data: WeatherData
  isGeolocated?: boolean
}

export function WeatherCard({ data, isGeolocated = false }: WeatherCardProps) {
  const [mounted, setMounted] = useState(false)
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const { unit } = useUnitStore()

  useEffect(() => { setMounted(true) }, [])

  const favorited = mounted && isFavorite(data.city)

  const toggleFavorite = () => {
    if (isFavorite(data.city)) {
      removeFavorite(data.city)
    } else {
      addFavorite({ name: data.city, country: data.country })
    }
  }

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-7 overflow-hidden relative">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-3xl pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex flex-col gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-white/40" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
                {data.country}
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="flex items-center gap-1 text-white/40 text-xs tabular-nums">
                <Clock size={11} className="text-white/30" />
                {data.localtime}
              </span>
            </div>
            {isGeolocated && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="self-start inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/80 text-xs whitespace-nowrap">Position actuelle</span>
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              {data.city}
            </h1>
            <motion.button
              onClick={toggleFavorite}
              whileTap={{ scale: 0.75 }}
              className="shrink-0 mt-0.5 focus:outline-none"
              aria-label={favorited ? `Retirer ${data.city} des favoris` : `Ajouter ${data.city} aux favoris`}
            >
              <Star
                size={18}
                className={`transition-all duration-300 ${
                  favorited
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    : 'text-white/25 hover:text-amber-400/60 fill-transparent'
                }`}
              />
            </motion.button>
          </div>
        </div>
        <motion.div
          key={data.city}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <WeatherIcon condition={data.condition} size={58} />
        </motion.div>
      </div>

      {/* Temperature */}
      <motion.div
        key={`${data.city}-temp`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-8xl sm:text-9xl font-thin text-white leading-none mb-2 tracking-tighter"
      >
        {tempRaw(data.temperature, unit)}°
      </motion.div>

      {/* Condition + unit label */}
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-white/60 text-lg font-light">{data.description}</p>
        <span className="text-white/25 text-xs">{unit === 'metric' ? 'Celsius' : 'Fahrenheit'}</span>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5">
          <Thermometer size={13} className="text-white/40" />
          <span className="text-white/50 text-xs">
            Ressenti {tempDisplay(data.feelsLike, unit)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5">
          <span className="text-white/50 text-xs">↑ {tempRaw(data.weekly[0].high, unit)}°</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/50 text-xs">↓ {tempRaw(data.weekly[0].low, unit)}°</span>
        </div>
      </div>
    </div>
  )
}
