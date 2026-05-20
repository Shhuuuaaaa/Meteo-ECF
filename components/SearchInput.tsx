'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { searchCities } from '@/lib/weatherApi'
import type { WeatherApiSearchResult } from '@/lib/weatherApiTypes'

interface SearchInputProps {
  onSelect: (cityName: string) => void
}

export function SearchInput({ onSelect }: SearchInputProps) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<WeatherApiSearchResult[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const containerRef  = useRef<HTMLDivElement>(null)
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listboxId     = useId()

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setIsSearching(true)
    try {
      const data = await searchCities(q)
      setResults(data)
    } catch {
      setResults([])
      toast.error('Recherche indisponible', {
        description: 'Impossible de joindre le service de recherche. Réessayez.',
      })
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, runSearch])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleSelect = (result: WeatherApiSearchResult) => {
    onSelect(result.name)
    setQuery('')
    setResults([])
    setIsFocused(false)
  }

  const showDropdown = isFocused && query.length >= 2 && (results.length > 0 || isSearching)

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-owns={listboxId}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 backdrop-blur-2xl border transition-all duration-300 ${
          isFocused ? 'border-white/30 bg-white/8' : 'border-white/10'
        }`}
      >
        {isSearching ? (
          <Loader2 size={17} className="text-white/40 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Search size={17} className="text-white/40 shrink-0" aria-hidden="true" />
        )}
        <input
          type="text"
          role="searchbox"
          aria-label="Rechercher une ville"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Rechercher une ville dans le monde…"
          className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setQuery(''); setResults([]) }}
              className="shrink-0"
              aria-label="Effacer la recherche"
            >
              <X size={15} className="text-white/40 hover:text-white/70 transition-colors" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label="Suggestions de villes"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl shadow-black/50 list-none p-0 m-0"
          >
            {isSearching && results.length === 0 ? (
              <li className="flex items-center gap-3 px-4 py-4 text-white/40 text-sm" aria-live="polite">
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                Recherche en cours…
              </li>
            ) : (
              results.map((result, i) => (
                <motion.li
                  key={result.id}
                  role="option"
                  aria-selected={false}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 last:border-0"
                >
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/8 transition-colors duration-150"
                    aria-label={`Sélectionner ${result.name}, ${result.country}`}
                  >
                    <MapPin size={15} className="text-white/30 shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{result.name}</p>
                      <p className="text-white/50 text-xs truncate">
                        {result.region ? `${result.region}, ` : ''}{result.country}
                      </p>
                    </div>
                  </button>
                </motion.li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
