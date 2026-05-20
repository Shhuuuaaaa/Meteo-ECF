'use client'

import { useEffect, useRef } from 'react'

interface Drop {
  x: number
  y: number
  r: number
  maxR: number
  opacity: number
  phase: 'grow' | 'still' | 'slide'
  vy: number
  life: number
  maxLife: number
}

interface Streak {
  x: number
  y: number
  len: number
  spd: number
  alpha: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const ANGLE = Math.tan((15 * Math.PI) / 180)

export function RainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const mobile = window.innerWidth < 768
    const DROP_COUNT = mobile ? 18 : 36
    const STREAK_COUNT = mobile ? 42 : 88

    let W = window.innerWidth
    let H = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    let raf: number

    function makeDrop(): Drop {
      return {
        x: rand(0, W),
        y: rand(0, H * 0.9),
        r: 0,
        maxR: rand(3, mobile ? 9 : 12),
        opacity: rand(0.5, 0.82),
        phase: 'grow',
        vy: 0,
        life: 0,
        maxLife: rand(90, 220),
      }
    }

    function makeStreak(): Streak {
      return {
        x: rand(-80, W + 80),
        y: rand(-H, H * 0.4),
        len: rand(12, 58),
        spd: rand(9, 22),
        alpha: rand(0.025, 0.085),
      }
    }

    const drops: Drop[] = Array.from({ length: DROP_COUNT }, makeDrop)
    const streaks: Streak[] = Array.from({ length: STREAK_COUNT }, makeStreak)

    function drawDrop(d: Drop) {
      const { x, y, r, opacity } = d
      if (r < 0.5) return

      // Base: glass-refraction disc
      const base = ctx.createRadialGradient(x, y, 0, x, y, r)
      base.addColorStop(0, `rgba(175,210,255,${opacity * 0.13})`)
      base.addColorStop(0.68, `rgba(135,180,235,${opacity * 0.07})`)
      base.addColorStop(1, `rgba(70,120,200,${opacity * 0.28})`)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = base
      ctx.fill()

      // Specular highlight — upper-left
      const hl = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, 0,
        x - r * 0.1, y - r * 0.1, r * 0.68
      )
      hl.addColorStop(0, `rgba(255,255,255,${opacity * 0.52})`)
      hl.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = hl
      ctx.fill()

      // Thin rim
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(110,160,225,${opacity * 0.22})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    function drawStreak(s: Streak) {
      const x2 = s.x + s.len * ANGLE
      const y2 = s.y + s.len
      const grad = ctx.createLinearGradient(s.x, s.y, x2, y2)
      grad.addColorStop(0, 'rgba(200,225,255,0)')
      grad.addColorStop(0.35, `rgba(200,225,255,${s.alpha})`)
      grad.addColorStop(1, 'rgba(200,225,255,0)')
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.stroke()
    }

    function tick() {
      ctx.clearRect(0, 0, W, H)

      for (const s of streaks) {
        drawStreak(s)
        s.y += s.spd
        if (s.y > H + s.len) {
          s.x = rand(-80, W + 80)
          s.y = -s.len * 2
          s.len = rand(12, 58)
          s.spd = rand(9, 22)
          s.alpha = rand(0.025, 0.085)
        }
      }

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        if (d.phase === 'grow') {
          d.r = Math.min(d.r + 0.35, d.maxR)
          if (d.r >= d.maxR) d.phase = 'still'
        } else if (d.phase === 'still') {
          d.life++
          if (d.life > d.maxLife) {
            d.phase = 'slide'
            d.vy = rand(0.4, 1.8)
          }
        } else {
          d.y += d.vy
          d.vy += 0.06
          d.opacity -= 0.016
          if (d.opacity <= 0 || d.y > H + 20) {
            drops[i] = makeDrop()
            continue
          }
        }
        drawDrop(d)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)
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
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  )
}
