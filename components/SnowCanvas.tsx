'use client'

import { useEffect, useRef } from 'react'

interface Flake {
  x: number
  y: number
  size: number
  speed: number
  swayAmp: number
  swaySpeed: number
  swayPhase: number
  opacity: number
}

export function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    const COUNT = isMobile ? 45 : 90

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const flakes: Flake[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2.8 + 0.8,
      speed: Math.random() * 0.7 + 0.25,
      swayAmp: Math.random() * 22 + 8,
      swaySpeed: Math.random() * 0.28 + 0.08,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.45 + 0.18,
    }))

    let t = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      for (const f of flakes) {
        f.y += f.speed
        f.x += Math.sin(t * f.swaySpeed + f.swayPhase) * 0.28

        if (f.y > H + 10) {
          f.y = -10
          f.x = Math.random() * W
        }

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 235, 255, ${f.opacity})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    const ro = new ResizeObserver(() => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    })
    ro.observe(document.documentElement)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: -7 }}
    />
  )
}
