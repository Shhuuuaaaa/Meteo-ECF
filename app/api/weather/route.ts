import { NextRequest } from 'next/server'

const BASE_URL = 'https://api.weatherapi.com/v1'

const Q_MAX_LEN = 100
// Accepts: unicode letters, digits, spaces, comma (lat,lon), dot, hyphen, apostrophe
const Q_PATTERN = /^[\p{L}\p{N}\s,\-.'']+$/u

// Simple in-memory rate limiter (process-local, best-effort on Vercel)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > 20
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return Response.json({ error: 'Trop de requêtes, réessayez dans une minute.' }, { status: 429 })
  }

  const q = request.nextUrl.searchParams.get('q')
  if (!q) {
    return Response.json({ error: 'Paramètre "q" requis' }, { status: 400 })
  }

  if (q.length > Q_MAX_LEN || !Q_PATTERN.test(q)) {
    return Response.json({ error: 'Paramètre "q" invalide' }, { status: 400 })
  }

  const apiKey = process.env.WEATHER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Clé API non configurée' }, { status: 500 })
  }

  const url = `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(q)}&days=7&lang=fr&aqi=no&alerts=no`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const status = res.status
      const clientError =
        status === 400 ? 'Ville introuvable' :
        status === 403 ? 'Clé API invalide' :
        status === 429 ? 'Service temporairement indisponible' :
        'Erreur du service météo'
      return Response.json({ error: clientError }, { status })
    }

    const data = await res.json()
    return Response.json(data, {
      headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' },
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      return Response.json({ error: 'Le service météo ne répond pas' }, { status: 504 })
    }
    return Response.json({ error: 'Impossible de récupérer les données météo' }, { status: 500 })
  }
}
