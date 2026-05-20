'use client'

import { motion } from 'framer-motion'
import type { WeatherCondition } from '@/lib/weatherData'

const conditionOrbs: Record<WeatherCondition, { orb1: string; orb2: string; orb3: string }> = {
  sunny:          { orb1: '#f59e0b', orb2: '#f97316', orb3: '#eab308' },
  'partly-cloudy':{ orb1: '#3b82f6', orb2: '#8b5cf6', orb3: '#06b6d4' },
  cloudy:         { orb1: '#475569', orb2: '#334155', orb3: '#64748b' },
  rainy:          { orb1: '#1d4ed8', orb2: '#0369a1', orb3: '#0ea5e9' },
  stormy:         { orb1: '#4c1d95', orb2: '#312e81', orb3: '#5b21b6' },
  snowy:          { orb1: '#bfdbfe', orb2: '#93c5fd', orb3: '#60a5fa' },
}


interface AnimatedBackgroundProps {
  condition: WeatherCondition
}

export function AnimatedBackground({ condition }: AnimatedBackgroundProps) {
  const orbs = conditionOrbs[condition]

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-950">
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{ width: 750, height: 750, opacity: 0.18, left: '-18%', top: '-18%', willChange: 'transform' }}
        animate={{ x: [0, 45, 0], y: [0, 35, 0], backgroundColor: orbs.orb1 }}
        transition={{
          x:               { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
          y:               { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
          backgroundColor: { duration: 1.5, ease: 'easeInOut' as const },
        }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{ width: 650, height: 650, opacity: 0.14, right: '-18%', bottom: '5%', willChange: 'transform' }}
        animate={{ x: [0, -35, 0], y: [0, 45, 0], backgroundColor: orbs.orb2 }}
        transition={{
          x:               { duration: 12, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 },
          y:               { duration: 12, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 },
          backgroundColor: { duration: 1.5, ease: 'easeInOut' as const },
        }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{ width: 500, height: 500, opacity: 0.12, left: '35%', bottom: '-12%', willChange: 'transform' }}
        animate={{ x: [0, 28, 0], y: [0, -42, 0], backgroundColor: orbs.orb3 }}
        transition={{
          x:               { duration: 14, repeat: Infinity, ease: 'easeInOut' as const, delay: 5 },
          y:               { duration: 14, repeat: Infinity, ease: 'easeInOut' as const, delay: 5 },
          backgroundColor: { duration: 1.5, ease: 'easeInOut' as const },
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 80% at center, transparent 30%, #030712 100%)' }}
      />
    </div>
  )
}
