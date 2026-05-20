'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'

// Sun positioned at 72% x, 10% y; flares trace the axis through the screen centre
const SUN_X = 72
const SUN_Y = 10
const CTR_X = 50
const CTR_Y = 50

// Enlarged, more diffuse zenith-sun flare — bigger halos, brighter core
const FLARES = [
  { t: 0.00, size: 1100, opacity: 0.20, color: '#fff9d0' }, // mega outer corona
  { t: 0.00, size:  650, opacity: 0.22, color: '#ffe8a0' }, // warm secondary halo
  { t: 0.00, size:  320, opacity: 0.28, color: '#fffde8' }, // sun disc
  { t: 0.00, size:  100, opacity: 0.88, color: '#fff8c0' }, // bright inner glow
  { t: 0.00, size:   32, opacity: 1.00, color: '#ffffff' }, // hot core
  { t: 0.18, size:   80, opacity: 0.26, color: '#ffd060' }, // first ring
  { t: 0.32, size:  180, opacity: 0.13, color: '#ddeeff' }, // cool arc
  { t: 0.48, size:   46, opacity: 0.32, color: '#ffffff' }, // ghost spot
  { t: 0.64, size:  120, opacity: 0.11, color: '#ffe0a0' }, // warm arc
  { t: 0.80, size:   28, opacity: 0.28, color: '#c8e8ff' }, // cool spot
  { t: 1.05, size:  260, opacity: 0.08, color: '#e8f2ff' }, // far ghost halo
  { t: 1.30, size:   65, opacity: 0.18, color: '#ffe8b0' }, // far warm ring
  { t: 1.60, size:   85, opacity: 0.10, color: '#d0e8ff' }, // far cool ring
] as const

interface FlareItemProps {
  t: number
  size: number
  opacity: number
  color: string
  springX: MotionValue<number>
  springY: MotionValue<number>
}

function FlareItem({ t, size, opacity, color, springX, springY }: FlareItemProps) {
  const lx = SUN_X + t * (CTR_X - SUN_X)
  const ly = SUN_Y + t * (CTR_Y - SUN_Y)
  const factor = Math.max(0, 1 - t * 0.45)

  const x = useTransform(springX, (v) => v * factor)
  const y = useTransform(springY, (v) => v * factor)

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `calc(${lx}% - ${size / 2}px)`,
        top: `calc(${ly}% - ${size / 2}px)`,
        width: size,
        height: size,
        x,
        y,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        opacity,
      }}
    />
  )
}

export function LensFlare() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 30, damping: 20, mass: 1.4 })
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20, mass: 1.4 })

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth  - 0.5) * 50)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 28)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -5, mixBlendMode: 'screen' }}
      aria-hidden="true"
    >
      {FLARES.map((f, i) => (
        <FlareItem key={i} {...f} springX={springX} springY={springY} />
      ))}
    </div>
  )
}
