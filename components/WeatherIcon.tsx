import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudSnow } from 'lucide-react'
import type { WeatherCondition } from '@/lib/weatherData'

interface WeatherIconProps {
  condition: WeatherCondition
  size?: number
  className?: string
}

const iconMap = {
  sunny: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  snowy: CloudSnow,
}

const colorMap: Record<WeatherCondition, string> = {
  sunny: 'text-amber-400',
  'partly-cloudy': 'text-sky-300',
  cloudy: 'text-slate-400',
  rainy: 'text-blue-400',
  stormy: 'text-violet-400',
  snowy: 'text-cyan-200',
}

export function WeatherIcon({ condition, size = 24, className = '' }: WeatherIconProps) {
  const Icon = iconMap[condition]
  const colorClass = colorMap[condition]
  return <Icon size={size} className={`${colorClass} ${className}`} strokeWidth={1.5} />
}
