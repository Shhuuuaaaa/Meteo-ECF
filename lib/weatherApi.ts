import type { WeatherApiResponse, WeatherApiSearchResult } from './weatherApiTypes'
import { transformWeatherApi } from './weatherTransform'
import type { WeatherData } from '@/lib/weatherData'

// Carries the HTTP status so callers can distinguish 4xx (bad input, no retry)
// from 5xx / network errors (transient, worth retrying).
export class WeatherError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'WeatherError'
  }
}

// All fetches go through /api/weather (our own Route Handler) rather than calling
// WeatherAPI directly, so WEATHER_API_KEY never appears in the client bundle.
// The `q` parameter accepts both a city name ("Paris") and GPS coordinates ("48.8566,2.3522")
// — WeatherAPI handles both formats identically on the server.
export async function fetchWeatherData(cityName: string): Promise<WeatherData> {
  const res = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new WeatherError(body?.error ?? `Erreur ${res.status}`, res.status)
  }

  const raw: WeatherApiResponse = await res.json()
  return transformWeatherApi(raw)
}

// Minimum 2 characters enforced here AND in the Route Handler to avoid
// hammering the API on every keystroke for very short queries.
export async function searchCities(query: string): Promise<WeatherApiSearchResult[]> {
  if (query.trim().length < 2) return []

  const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) return []

  return res.json()
}
