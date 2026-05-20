'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useFavoritesStore } from '@/lib/useFavoritesStore'

interface FavoritesBarProps {
  onSelect: (cityName: string) => void
}

export function FavoritesBar({ onSelect }: FavoritesBarProps) {
  const [mounted, setMounted] = useState(false)
  const { favorites, removeFavorite } = useFavoritesStore()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || favorites.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-1.5">
        <Star size={11} className="text-amber-400/50 fill-amber-400/50" />
        <span className="text-white/25 text-xs uppercase tracking-widest font-medium">Favoris</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <AnimatePresence mode="popLayout">
          {favorites.map((city) => (
            <motion.div
              key={city.name}
              layout
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="flex items-center bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/25 rounded-full transition-colors duration-200"
            >
              <button
                onClick={() => onSelect(city.name)}
                className="pl-3 pr-1.5 py-1.5 text-white/60 hover:text-white/90 text-xs font-medium transition-colors duration-150 leading-none"
              >
                {city.name}
              </button>
              <button
                onClick={() => removeFavorite(city.name)}
                className="pr-2.5 pl-0.5 py-1.5 text-white/20 hover:text-rose-400/70 transition-colors duration-150"
                aria-label={`Retirer ${city.name} des favoris`}
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
