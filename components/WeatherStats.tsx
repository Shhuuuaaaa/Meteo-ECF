'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Wind, Eye, Sun, Sunrise, Sunset } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useUnitStore } from '@/lib/useUnitStore'
import { windDisplay, visibilityDisplay, pressureDisplay } from '@/lib/units'
import type { WeatherData } from '@/lib/weatherData'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  sub?: ReactNode
  delay?: number
}

function StatCard({ icon, label, value, sub, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col gap-3 p-5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10"
    >
      <div className="flex items-center gap-2">
        <span className="text-white/40">{icon}</span>
        <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-white text-3xl font-light tracking-tight">{value}</p>
      {sub && <div className="text-white/30 text-xs">{sub}</div>}
    </motion.div>
  )
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Faible'
  if (uv <= 5) return 'Modéré'
  if (uv <= 7) return 'Élevé'
  if (uv <= 10) return 'Très élevé'
  return 'Extrême'
}

const uvColors: Record<string, string> = {
  Faible:       'text-emerald-400 border-emerald-400/30',
  Modéré:       'text-yellow-400 border-yellow-400/30',
  Élevé:        'text-orange-400 border-orange-400/30',
  'Très élevé': 'text-red-400 border-red-400/30',
  Extrême:      'text-rose-400 border-rose-400/30',
}

interface WeatherStatsProps {
  data: WeatherData
}

export function WeatherStats({ data }: WeatherStatsProps) {
  const { unit } = useUnitStore()
  const uvLevel  = uvLabel(data.uvIndex)

  return (
    <div>
      <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-3">
        Détails
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Droplets size={16} />}
          label="Humidité"
          value={`${data.humidity}%`}
          sub="Taux d'humidité relative"
          delay={0.1}
        />
        <StatCard
          icon={<Wind size={16} />}
          label="Vent"
          value={windDisplay(data.windSpeed, unit)}
          sub={`Direction ${data.windDirection}`}
          delay={0.15}
        />
        <StatCard
          icon={<Eye size={16} />}
          label="Visibilité"
          value={visibilityDisplay(data.visibility, unit)}
          sub={
            data.visibility >= 10
              ? 'Excellente'
              : data.visibility >= 5
                ? 'Bonne'
                : 'Réduite'
          }
          delay={0.2}
        />
        <StatCard
          icon={<Sun size={16} />}
          label="UV Index"
          value={`${data.uvIndex}`}
          sub={
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-2 py-0.5 h-auto bg-transparent',
                uvColors[uvLevel]
              )}
            >
              {uvLevel}
            </Badge>
          }
          delay={0.25}
        />
        <StatCard
          icon={<Sunrise size={16} />}
          label="Lever"
          value={data.sunrise}
          sub="Heure locale"
          delay={0.3}
        />
        <StatCard
          icon={<Sunset size={16} />}
          label="Coucher"
          value={data.sunset}
          sub={pressureDisplay(data.pressure, unit)}
          delay={0.35}
        />
      </div>
    </div>
  )
}
