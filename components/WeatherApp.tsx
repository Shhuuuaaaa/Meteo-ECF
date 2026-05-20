'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, MapPinOff, CloudOff, RefreshCw } from 'lucide-react'
import { WeatherError, fetchWeatherData } from '@/lib/weatherApi'
import { useWeatherConditionStore } from '@/lib/useWeatherConditionStore'
import { SearchInput } from './SearchInput'
import { FavoritesBar } from './FavoritesBar'
import { UnitToggle } from './UnitToggle'
import { WeatherCard } from './WeatherCard'
import { HourlyForecast } from './HourlyForecast'
import { WeatherStats } from './WeatherStats'
import { WeeklyForecast } from './WeeklyForecast'
import { WeatherSkeleton } from './WeatherSkeleton'

const WeeklyChart = dynamic(
  () => import('./WeeklyChart').then((m) => m.WeeklyChart),
  { ssr: false }
)

const WeatherMap = dynamic(
  () => import('./WeatherMap').then((m) => m.WeatherMap),
  { ssr: false }
)

const DEFAULT_CITY = 'Paris'

type GeoStatus = 'detecting' | 'granted' | 'denied'

export function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isGeolocated, setIsGeolocated] = useState(false)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('detecting')

  const toastPendingRef = useRef(false)
  const prevFetchingRef = useRef(false)

  const setCondition = useWeatherConditionStore((s) => s.setCondition)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setSelectedCity(DEFAULT_CITY)
      setGeoStatus('denied')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const q = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`
        toastPendingRef.current = true
        setSelectedCity(q)
        setIsGeolocated(true)
        setGeoStatus('granted')
      },
      () => {
        setSelectedCity(DEFAULT_CITY)
        setGeoStatus('denied')
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )
  }, [])

  const { data: weather, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['weather', selectedCity],
    queryFn: () => fetchWeatherData(selectedCity!),
    enabled: !!selectedCity,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (weather) {
      setCondition(weather.condition, weather.isDay, weather.temperature)
    }
  }, [weather, setCondition])

  useEffect(() => {
    const wasFetching = prevFetchingRef.current
    prevFetchingRef.current = isFetching

    if (wasFetching && !isFetching && toastPendingRef.current) {
      toastPendingRef.current = false

      if (isError) {
        toast.error('Ville introuvable', {
          description: 'Aucune donnée disponible pour cette ville.',
        })
      }
    }
  }, [isFetching, isError, weather])

  const handleCitySelect = (cityName: string) => {
    toastPendingRef.current = true
    setSelectedCity(cityName)
    setIsGeolocated(false)
  }

  const currentHourIndex = Math.min(new Date().getHours(), (weather?.hourly.length ?? 1) - 1)

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4 lg:px-10 lg:py-8"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-md lg:max-w-5xl mx-auto flex flex-col gap-4">

        {/* ── Barre de contrôles — centrée et étroite sur desktop ── */}
        <div className="flex flex-col gap-3 lg:max-w-lg lg:mx-auto lg:w-full">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <div className="flex-1">
              <SearchInput onSelect={handleCitySelect} />
            </div>
            <UnitToggle />
          </motion.div>

          <AnimatePresence>
            {geoStatus === 'detecting' && (
              <motion.div
                key="geo-detecting"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-white/30 text-xs px-1"
              >
                <Loader2 size={11} className="animate-spin" />
                Détection de votre position…
              </motion.div>
            )}
          </AnimatePresence>

          <FavoritesBar onSelect={handleCitySelect} />
        </div>

        {/* ── Barre de progression ── */}
        <AnimatePresence>
          {isFetching && (
            <motion.div
              key="progress-bar"
              role="status"
              aria-live="polite"
              aria-label="Chargement en cours"
              className="h-px w-full overflow-hidden rounded-full bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-violet-500 to-sky-500"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Contenu principal ── */}
        <AnimatePresence mode="wait">
          {isError && !weather ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center flex flex-col items-center gap-3 lg:max-w-lg lg:mx-auto lg:w-full"
            >
              {error instanceof WeatherError && error.status < 500 ? (
                <>
                  <MapPinOff size={28} className="text-white/30" />
                  <p className="text-white/60 text-sm">Ville introuvable</p>
                  <p className="text-white/30 text-xs">Essayez un autre nom de ville</p>
                </>
              ) : (
                <>
                  <CloudOff size={28} className="text-white/30" />
                  <p className="text-white/60 text-sm">Impossible de charger la météo</p>
                  <p className="text-white/30 text-xs mb-1">Vérifiez votre connexion internet</p>
                  <button
                    onClick={() => refetch()}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Réessayer
                  </button>
                </>
              )}
            </motion.div>
          ) : weather ? (
            <motion.div
              key={selectedCity}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isFetching ? 0.5 : 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6"
            >
              {/* ── Colonne gauche : météo actuelle + courbe (grandit) + stats ── */}
              <div className="flex flex-col gap-4">
                <WeatherCard data={weather} isGeolocated={isGeolocated} />
                <div className="flex-1 min-h-0 flex flex-col">
                  <WeeklyChart weekly={weather.weekly} />
                </div>
                <WeatherStats data={weather} />
              </div>

              {/* ── Colonne droite : horaire + prévisions 7j + carte (grandit) ── */}
              <div className="flex flex-col gap-4">
                <HourlyForecast hourly={weather.hourly} currentHourIndex={currentHourIndex} />
                <WeeklyForecast weekly={weather.weekly} />
                <div className="flex-1 min-h-0 flex flex-col">
                  <WeatherMap lat={weather.lat} lon={weather.lon} city={weather.city} />
                </div>
              </div>
            </motion.div>
          ) : (
            <WeatherSkeleton key="skeleton" />
          )}
        </AnimatePresence>

      </div>

      <p className="text-white/20 text-xs text-center mt-6 pb-2 tracking-wide">
        Fait par <span className="text-white/35 font-medium">Joshua Prevost</span> · 2025 · Meteo-ECF
      </p>
    </div>
  )
}
