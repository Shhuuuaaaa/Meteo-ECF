'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useWeatherConditionStore } from '@/lib/useWeatherConditionStore'
import type { WeatherCondition } from '@/lib/weatherData'

const ParticleCanvas = dynamic(
  () => import('./ParticleCanvas').then((m) => m.ParticleCanvas),
  { ssr: false }
)
const RainCanvas = dynamic(
  () => import('./RainCanvas').then((m) => m.RainCanvas),
  { ssr: false }
)
const LensFlare = dynamic(
  () => import('./LensFlare').then((m) => m.LensFlare),
  { ssr: false }
)
const StarCanvas = dynamic(
  () => import('./StarCanvas').then((m) => m.StarCanvas),
  { ssr: false }
)
const SnowCanvas = dynamic(
  () => import('./SnowCanvas').then((m) => m.SnowCanvas),
  { ssr: false }
)

// ─────────────────────────────────────────────────────────────────────────────
// Orb colour palettes
// ─────────────────────────────────────────────────────────────────────────────

type OrbColors = { orb1: string; orb2: string; orb3: string }

// JOUR — lumineux et vivant : bleu azur / crème soleil / gris-perle selon la météo
// (sunny est géré dynamiquement selon la température — voir WeatherBackground)
const DAY_ORBS: Record<WeatherCondition, OrbColors> = {
  sunny:           { orb1: '#38bdf8', orb2: '#fef08a', orb3: '#7dd3fc' }, // fallback — remplacé en runtime
  'partly-cloudy': { orb1: '#93c5fd', orb2: '#bfdbfe', orb3: '#60a5fa' }, // bleu doux
  cloudy:          { orb1: '#94a3b8', orb2: '#cbd5e1', orb3: '#64748b' }, // gris-perle / acier clair
  rainy:           { orb1: '#3b82f6', orb2: '#60a5fa', orb3: '#1d4ed8' }, // bleu acier pluvieux
  stormy:          { orb1: '#4338ca', orb2: '#5b21b6', orb3: '#7c3aed' }, // violet-sombre orageux
  snowy:           { orb1: '#bae6fd', orb2: '#e0f2fe', orb3: '#93c5fd' }, // blanc-bleuté givré
}

// Palettes solaires selon la température (uniquement is_day=1, condition=sunny)
const SUNNY_WARM: OrbColors = { orb1: '#e0f9ff', orb2: '#fff9c4', orb3: '#bae6fd' } // azur→blanc crème chaud
const SUNNY_COOL: OrbColors = { orb1: '#dbeafe', orb2: '#f0f9ff', orb3: '#bfdbfe' } // bleu cristallin froid

// NUIT — profond et thématisé, jamais noir plat
const NIGHT_ORBS: Record<WeatherCondition, OrbColors> = {
  sunny:           { orb1: '#f59e0b', orb2: '#f97316', orb3: '#eab308' }, // crépuscule / aurore
  'partly-cloudy': { orb1: '#1e1b4b', orb2: '#0f172a', orb3: '#172554' }, // bleu nuit dégagé
  cloudy:          { orb1: '#1e293b', orb2: '#0f172a', orb3: '#334155' }, // ardoise sombre
  rainy:           { orb1: '#1e3a5f', orb2: '#0c1a2e', orb3: '#1d4ed8' }, // bleu pluvieux profond
  stormy:          { orb1: '#4c1d95', orb2: '#312e81', orb3: '#5b21b6' }, // violet orageux
  snowy:           { orb1: '#0f2a4f', orb2: '#1e2a4a', orb3: '#1a2d5c' }, // bleu givré froid
}

// ─────────────────────────────────────────────────────────────────────────────
// Base background colours (the absolute darkest tone behind the orbs)
// ─────────────────────────────────────────────────────────────────────────────

const DAY_BASE: Record<WeatherCondition, string> = {
  sunny:           '#0ea5e9',  // azur vif — remplacé dynamiquement selon température
  'partly-cloudy': '#163d6b',  // ciel légèrement voilé
  cloudy:          '#2a3d50',  // ciel gris-bleu couvert
  rainy:           '#1a2f45',  // ciel pluvieux sombre
  stormy:          '#120f20',  // ciel orageux quasi-nuit
  snowy:           '#3d5a72',  // bleu acier givré
}

const SUNNY_WARM_BASE = '#0ea5e9'  // azur vibrant (chaleur > 20°C)
const SUNNY_COOL_BASE = '#1e40af'  // bleu cristallin froid (≤ 20°C)

const NIGHT_BASE: Record<WeatherCondition, string> = {
  sunny:           '#030712',
  'partly-cloudy': '#020410',
  cloudy:          '#020508',
  rainy:           '#020510',
  stormy:          '#030212',
  snowy:           '#020508',
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CloudShape({ width, top, duration, opacity, delay, reduced }: {
  width: number; top: string; duration: number; opacity: number; delay: number; reduced?: boolean
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{ top, width, opacity, left: reduced ? '10%' : 0 }}
      initial={reduced ? false : { x: '110vw' }}
      animate={reduced ? {} : { x: '-30vw' }}
      transition={{ duration, repeat: Infinity, ease: 'linear' as const, delay, repeatDelay: 0 }}
    >
      <svg viewBox="0 0 300 120" fill="none" width="100%" height="auto">
        <ellipse cx="150" cy="95" rx="150" ry="38" fill="rgba(255,255,255,0.05)" />
        <ellipse cx="110" cy="78" rx="90"  ry="42" fill="rgba(255,255,255,0.04)" />
        <ellipse cx="200" cy="72" rx="80"  ry="36" fill="rgba(255,255,255,0.04)" />
        <ellipse cx="150" cy="58" rx="68"  ry="33" fill="rgba(255,255,255,0.03)" />
      </svg>
    </motion.div>
  )
}

// Halo lunaire discret pour les nuits dégagées
function MoonHalo() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: -8 }}>
      {/* Noyau lumineux */}
      <div style={{
        position: 'absolute',
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(210,228,255,0.065) 0%, rgba(180,210,255,0.022) 55%, transparent 100%)',
        top: '-10%',
        right: '6%',
        filter: 'blur(6px)',
      }} />
      {/* Couronne externe */}
      <div style={{
        position: 'absolute',
        width: 560,
        height: 560,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,220,255,0.022) 0%, transparent 65%)',
        top: '-18%',
        right: '-2%',
      }} />
      {/* Anneau diffus */}
      <div style={{
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: '50%',
        border: '1px solid rgba(200,218,255,0.045)',
        top: '-14%',
        right: '2%',
        filter: 'blur(3px)',
      }} />
    </div>
  )
}

// Éclair de foudre aléatoire toutes les 4–12 s
function LightningFlash() {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timeout: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      timeout = setTimeout(() => {
        setFlash(true)
        setTimeout(() => { setFlash(false); scheduleNext() }, 110)
      }, 4000 + Math.random() * 8000)
    }

    scheduleNext()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key="lightning-flash"
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 2, backgroundColor: 'rgba(200, 185, 255, 1)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.16, 0.07, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, times: [0, 0.06, 0.45, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const T = 2  // transition duration (s) — all colour changes

export function WeatherBackground() {
  const { condition, isDay, temperature } = useWeatherConditionStore()
  const reducedMotion = useReducedMotion()

  const isSunnyDay = isDay && condition === 'sunny'
  const isWarm     = temperature >= 20

  // Write day/night + bright-mode states to <html> for global CSS targeting
  useEffect(() => {
    document.documentElement.dataset.time = isDay ? 'day' : 'night'
  }, [isDay])
  useEffect(() => {
    if (isSunnyDay) {
      document.documentElement.dataset.bright = 'true'
    } else {
      delete document.documentElement.dataset.bright
    }
  }, [isSunnyDay])

  // Sunny day uses temperature-split palettes; everything else uses the lookup tables
  const orbs = isSunnyDay
    ? (isWarm ? SUNNY_WARM : SUNNY_COOL)
    : (isDay ? DAY_ORBS[condition] : NIGHT_ORBS[condition])

  const baseColor = isSunnyDay
    ? (isWarm ? SUNNY_WARM_BASE : SUNNY_COOL_BASE)
    : (isDay ? DAY_BASE[condition] : NIGHT_BASE[condition])

  // Sunny orbs are much more opaque — they must fill the sky almost to white
  const [op1, op2, op3] = isSunnyDay
    ? (isWarm ? [0.78, 0.65, 0.55] : [0.72, 0.60, 0.50])
    : (isDay  ? [0.52, 0.40, 0.32] : [0.18, 0.14, 0.12])

  const showLensFlare = isSunnyDay
  // Étoiles et halo lunaire : nuit avec ciel dégagé (sunny = nuit claire / partly-cloudy = nuit étoilée)
  const showStars    = !isDay && (condition === 'sunny' || condition === 'partly-cloudy')
  const showMoonHalo = !isDay && (condition === 'sunny' || condition === 'partly-cloudy')
  const showRain      = condition === 'rainy' || condition === 'stormy'
  const showLightning = condition === 'stormy'
  const showSnow      = condition === 'snowy'
  const showClouds    = condition === 'cloudy'

  const fade = (d: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: d, ease: 'easeInOut' as const },
  })

  return (
    <>
      {/* ── Couche de base : couleur animée + orbes ── */}
      <motion.div
        className="fixed inset-0 -z-10 overflow-hidden"
        animate={{ backgroundColor: baseColor }}
        transition={{ duration: T, ease: 'easeInOut' as const }}
      >

        {/* Orbe 1 — grand, coin haut-gauche */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 750, height: 750, left: '-18%', top: '-18%', willChange: 'transform' }}
          animate={{ x: reducedMotion ? 0 : [0, 45, 0], y: reducedMotion ? 0 : [0, 35, 0], backgroundColor: orbs.orb1, opacity: op1 }}
          transition={{
            x:               { duration: 10, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const },
            y:               { duration: 10, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const },
            backgroundColor: { duration: T, ease: 'easeInOut' as const },
            opacity:         { duration: T, ease: 'easeInOut' as const },
          }}
        />

        {/* Orbe 2 — moyen, coin bas-droit */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 650, height: 650, right: '-18%', bottom: '5%', willChange: 'transform' }}
          animate={{ x: reducedMotion ? 0 : [0, -35, 0], y: reducedMotion ? 0 : [0, 45, 0], backgroundColor: orbs.orb2, opacity: op2 }}
          transition={{
            x:               { duration: 12, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const, delay: 2 },
            y:               { duration: 12, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const, delay: 2 },
            backgroundColor: { duration: T, ease: 'easeInOut' as const },
            opacity:         { duration: T, ease: 'easeInOut' as const },
          }}
        />

        {/* Orbe 3 — petit, bas-centre */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 500, height: 500, left: '35%', bottom: '-12%', willChange: 'transform' }}
          animate={{ x: reducedMotion ? 0 : [0, 28, 0], y: reducedMotion ? 0 : [0, -42, 0], backgroundColor: orbs.orb3, opacity: op3 }}
          transition={{
            x:               { duration: 14, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const, delay: 5 },
            y:               { duration: 14, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' as const, delay: 5 },
            backgroundColor: { duration: T, ease: 'easeInOut' as const },
            opacity:         { duration: T, ease: 'easeInOut' as const },
          }}
        />

        {/* Formes nuageuses SVG (temps nuageux) */}
        <AnimatePresence>
          {showClouds && (
            <motion.div key="clouds" {...fade(2)}>
              <CloudShape width={440} top="6%"  duration={58} opacity={0.70} delay={0}  reduced={!!reducedMotion} />
              <CloudShape width={320} top="26%" duration={72} opacity={0.50} delay={16} reduced={!!reducedMotion} />
              <CloudShape width={500} top="52%" duration={46} opacity={0.42} delay={6}  reduced={!!reducedMotion} />
              <CloudShape width={270} top="74%" duration={82} opacity={0.60} delay={32} reduced={!!reducedMotion} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grille de points */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Vignette de bord — toujours présente */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at center, transparent 30%, #030712 100%)' }}
        />

        {/* Assombrissement central de jour — garantit la lisibilité du texte
            sur les cartes glassmorphism lorsque les orbes sont plus lumineux */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isDay ? 1 : 0 }}
          transition={{ duration: T, ease: 'easeInOut' as const }}
          style={{ background: 'radial-gradient(ellipse 70% 70% at center, rgba(0,0,0,0.40) 0%, transparent 100%)' }}
        />
      </motion.div>

      {/* ── Halo lunaire (nuit dégagée) ── */}
      <AnimatePresence>
        {showMoonHalo && (
          <motion.div key="moon-halo" {...fade(2.5)}>
            <MoonHalo />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Réseau de particules (toujours actif) ── */}
      <ParticleCanvas condition={condition} />

      {/* ── Effets conditionnels, tous en fondu enchaîné ── */}
      <AnimatePresence>
        {showLensFlare && (
          <motion.div key="lensflare" {...fade(1.8)}>
            <LensFlare />
          </motion.div>
        )}
        {showStars && (
          <motion.div key="stars" {...fade(1.5)}>
            <StarCanvas />
          </motion.div>
        )}
        {showRain && (
          <motion.div key="rain" {...fade(1.2)}>
            <RainCanvas />
          </motion.div>
        )}
        {showSnow && (
          <motion.div key="snow" {...fade(1.5)}>
            <SnowCanvas />
          </motion.div>
        )}
      </AnimatePresence>

      {/* L'éclair est géré en interne — ne pas démonter entre les flashs */}
      {showLightning && <LightningFlash />}
    </>
  )
}
