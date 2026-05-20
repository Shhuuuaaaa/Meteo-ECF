import type { WeatherApiResponse } from './weatherApiTypes'
import type { WeatherCondition, WeatherData, HourlyWeather, DailyWeather } from './weatherData'

// WeatherAPI returns ~60 granular condition codes (e.g. 1180 = "Patchy light rain",
// 1183 = "Light rain"). We collapse them into 6 internal types so the UI only needs
// to handle a fixed set of icons, colors, and background themes.
const CODE_MAP: Record<number, WeatherCondition> = {
  1000: 'sunny',         // Clear / Sunny
  1003: 'partly-cloudy', // Partly cloudy
  1006: 'cloudy',        // Cloudy
  1009: 'cloudy',        // Overcast
  1030: 'cloudy',        // Mist
  1063: 'rainy',         // Patchy rain possible
  1066: 'snowy',         // Patchy snow possible
  1069: 'snowy',         // Patchy sleet possible
  1072: 'snowy',         // Patchy freezing drizzle
  1087: 'stormy',        // Thundery outbreaks possible
  1114: 'snowy',         // Blowing snow
  1117: 'snowy',         // Blizzard
  1135: 'cloudy',        // Fog
  1147: 'cloudy',        // Freezing fog
  1150: 'rainy',         // Patchy light drizzle
  1153: 'rainy',         // Light drizzle
  1168: 'rainy',         // Freezing drizzle
  1171: 'rainy',         // Heavy freezing drizzle
  1180: 'rainy',         // Patchy light rain
  1183: 'rainy',         // Light rain
  1186: 'rainy',         // Moderate rain at times
  1189: 'rainy',         // Moderate rain
  1192: 'rainy',         // Heavy rain at times
  1195: 'rainy',         // Heavy rain
  1198: 'rainy',         // Light freezing rain
  1201: 'rainy',         // Moderate/heavy freezing rain
  1204: 'snowy',         // Light sleet
  1207: 'snowy',         // Moderate/heavy sleet
  1210: 'snowy',         // Patchy light snow
  1213: 'snowy',         // Light snow
  1216: 'snowy',         // Patchy moderate snow
  1219: 'snowy',         // Moderate snow
  1222: 'snowy',         // Patchy heavy snow
  1225: 'snowy',         // Heavy snow
  1237: 'snowy',         // Ice pellets
  1240: 'rainy',         // Light rain shower
  1243: 'rainy',         // Moderate/heavy rain shower
  1246: 'rainy',         // Torrential rain shower
  1249: 'snowy',         // Light sleet showers
  1252: 'snowy',         // Moderate/heavy sleet showers
  1255: 'snowy',         // Light snow showers
  1258: 'snowy',         // Moderate/heavy snow showers
  1261: 'snowy',         // Light showers of ice pellets
  1264: 'snowy',         // Moderate/heavy showers of ice pellets
  1273: 'stormy',        // Patchy light rain with thunder
  1276: 'stormy',        // Moderate/heavy rain with thunder
  1279: 'stormy',        // Patchy light snow with thunder
  1282: 'stormy',        // Moderate/heavy snow with thunder
}

function mapCode(code: number, isDay: number): WeatherCondition {
  // Code 1000 (Clear) at night maps to 'partly-cloudy' because WeatherIcon
  // has no moon/night variant — a blank sky icon would be confusing.
  if (code === 1000 && isDay === 0) return 'partly-cloudy'
  return CODE_MAP[code] ?? 'cloudy'
}

// WeatherAPI returns sunrise/sunset in 12-hour format ("06:28 AM").
// We convert to 24-hour ("06:28") for consistent display across locales.
function to24h(time: string): string {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return time
  let h = parseInt(m[1])
  const min = m[2]
  const period = m[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${h.toString().padStart(2, '0')}:${min}`
}

// "2024-05-14 09:00" → "09h"
function formatHour(time: string): string {
  return time.split(' ')[1].slice(0, 2) + 'h'
}

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export function transformWeatherApi(raw: WeatherApiResponse): WeatherData {
  const { location, current, forecast } = raw

  const condition = mapCode(current.condition.code, current.is_day)

  // Use the API's localtime (city timezone) rather than the viewer's clock,
  // so the highlighted "current hour" in HourlyForecast is always correct
  // regardless of where the user is located.
  const currentHour = parseInt(location.localtime.split(' ')[1].split(':')[0])

  // Slice today's remaining hours, then pad with tomorrow's if needed.
  // Without this, a user visiting at 23:00 would only see one hour in the row.
  const todayHours = forecast.forecastday[0].hour
  const remaining = todayHours.filter(
    (h) => parseInt(h.time.split(' ')[1].split(':')[0]) >= currentHour
  )
  const tomorrowHours = forecast.forecastday[1]?.hour ?? []
  const combined = [...remaining, ...tomorrowHours].slice(0, 12)

  const hourly: HourlyWeather[] = combined.map((h) => ({
    time: formatHour(h.time),
    temp: Math.round(h.temp_c),
    condition: mapCode(h.condition.code, h.is_day),
  }))

  // 7-day forecast — first entry is always today, labelled "Aujourd'hui"
  // instead of repeating the day name already shown in the card header.
  const weekly: DailyWeather[] = forecast.forecastday.map((day, i) => {
    const date = new Date(day.date)
    const name = i === 0 ? "Aujourd'hui" : DAY_NAMES[date.getDay()]
    return {
      day: name,
      high: Math.round(day.day.maxtemp_c),
      low: Math.round(day.day.mintemp_c),
      condition: mapCode(day.day.condition.code, 1),
    }
  })

  const astro = forecast.forecastday[0].astro

  return {
    city: location.name,
    country: location.country,
    lat: location.lat,
    lon: location.lon,
    temperature: Math.round(current.temp_c),
    feelsLike: Math.round(current.feelslike_c),
    condition,
    isDay: current.is_day === 1,
    description: current.condition.text,
    humidity: current.humidity,
    windSpeed: Math.round(current.wind_kph),
    windDirection: current.wind_dir,
    uvIndex: Math.round(current.uv),
    visibility: Math.round(current.vis_km),
    pressure: Math.round(current.pressure_mb),
    sunrise: to24h(astro.sunrise),
    sunset: to24h(astro.sunset),
    localtime: location.localtime.split(' ')[1].slice(0, 5),
    hourly,
    weekly,
  }
}
