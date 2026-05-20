// WeatherAPI.com raw response shapes

export interface WeatherApiCondition {
  text: string
  icon: string
  code: number
}

export interface WeatherApiCurrent {
  temp_c: number
  feelslike_c: number
  humidity: number
  wind_kph: number
  wind_dir: string
  pressure_mb: number
  vis_km: number
  uv: number
  is_day: number
  condition: WeatherApiCondition
}

export interface WeatherApiForecastHour {
  time: string
  temp_c: number
  is_day: number
  condition: WeatherApiCondition
}

export interface WeatherApiForecastDay {
  date: string
  day: {
    maxtemp_c: number
    mintemp_c: number
    condition: WeatherApiCondition
  }
  astro: {
    sunrise: string
    sunset: string
  }
  hour: WeatherApiForecastHour[]
}

export interface WeatherApiResponse {
  location: {
    name: string
    country: string
    localtime: string
    lat: number
    lon: number
  }
  current: WeatherApiCurrent
  forecast: {
    forecastday: WeatherApiForecastDay[]
  }
}

export interface WeatherApiSearchResult {
  id: number
  name: string
  region: string
  country: string
  lat: number
  lon: number
}
