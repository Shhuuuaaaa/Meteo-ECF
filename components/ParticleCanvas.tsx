'use client'

import { useEffect, useRef } from 'react'
import type { WeatherCondition } from '@/lib/weatherData'

const CONDITION_COLORS: Record<WeatherCondition, string> = {
  sunny: '#f59e0b',
  'partly-cloudy': '#60a5fa',
  cloudy: '#94a3b8',
  rainy: '#3b82f6',
  stormy: '#8b5cf6',
  snowy: '#bfdbfe',
}

interface Props {
  condition: WeatherCondition
}

export function ParticleCanvas({ condition }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const color = CONDITION_COLORS[condition]
    const isMobile = window.innerWidth < 768
    const COUNT = isMobile ? 28 : 55
    const MAX_DIST = isMobile ? 80 : 110

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.2 + 0.05,
    }))

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = Math.floor((1 - dist / MAX_DIST) * 22)
              .toString(16)
              .padStart(2, '0')
            ctx.strokeStyle = color + alpha
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw and move particles
      for (const p of particles) {
        const alpha = Math.floor(p.opacity * 255)
          .toString(16)
          .padStart(2, '0')
        ctx.fillStyle = color + alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        // Wrap around edges with small buffer
        if (p.x < -4) p.x = canvas.width + 4
        else if (p.x > canvas.width + 4) p.x = -4
        if (p.y < -4) p.y = canvas.height + 4
        else if (p.y > canvas.height + 4) p.y = -4
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [condition])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -8 }}
    />
  )
}
