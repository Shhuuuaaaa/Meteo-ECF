'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUnitStore } from '@/lib/useUnitStore'

export function UnitToggle() {
  const [mounted, setMounted] = useState(false)
  const { unit, toggle } = useUnitStore()

  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className="shrink-0 flex items-center gap-0.5 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all"
      aria-label={mounted ? (unit === 'metric' ? 'Passer en Fahrenheit' : 'Passer en Celsius') : 'Unité de température'}
    >
      <span className={`text-xs font-semibold transition-colors ${mounted && unit === 'metric' ? 'text-white' : 'text-white/30'}`}>
        °C
      </span>
      <span className="text-white/15 text-xs mx-0.5">|</span>
      <span className={`text-xs font-semibold transition-colors ${mounted && unit === 'imperial' ? 'text-white' : 'text-white/30'}`}>
        °F
      </span>
    </motion.button>
  )
}
