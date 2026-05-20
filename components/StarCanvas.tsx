'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  phase: number
  speed: number
}

export function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    const COUNT = isMobile ? 70 : 140

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const stars: Star[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.88,
      size: Math.random() * 1.3 + 0.3,
      baseOpacity: Math.random() * 0.55 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.12,
    }))

    let t = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      for (const s of stars) {
        const opacity = s.baseOpacity * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase))

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215, 230, 255, ${opacity})`
        ctx.fill()

        // Cross glint on larger stars
        if (s.size > 1.1) {
          const gl = s.size * 2.2
          ctx.strokeStyle = `rgba(200, 218, 255, ${opacity * 0.38})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - gl, s.y)
          ctx.lineTo(s.x + gl, s.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(s.x, s.y - gl)
          ctx.lineTo(s.x, s.y + gl)
          ctx.stroke()
        }
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
