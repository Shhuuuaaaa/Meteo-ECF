export type Unit = 'metric' | 'imperial'

export function tempDisplay(celsius: number, unit: Unit): string {
  return unit === 'imperial'
    ? `${Math.round(celsius * 9 / 5 + 32)}°F`
    : `${celsius}°C`
}

export function tempRaw(celsius: number, unit: Unit): number {
  return unit === 'imperial' ? Math.round(celsius * 9 / 5 + 32) : celsius
}

export function windDisplay(kph: number, unit: Unit): string {
  return unit === 'imperial'
    ? `${Math.round(kph * 0.621371)} mph`
    : `${kph} km/h`
}

export function visibilityDisplay(km: number, unit: Unit): string {
  return unit === 'imperial'
    ? `${(km * 0.621371).toFixed(1)} mi`
    : `${km} km`
}

export function pressureDisplay(mb: number, unit: Unit): string {
  return unit === 'imperial'
    ? `${(mb * 0.02953).toFixed(2)} inHg`
    : `${mb} hPa`
}
