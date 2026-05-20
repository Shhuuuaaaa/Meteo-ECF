// Internal data types — independent of any external API

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'

export interface HourlyWeather {
  time: string
  temp: number
  condition: WeatherCondition
}

export interface DailyWeather {
  day: string
  high: number
  low: number
  condition: WeatherCondition
}

export interface WeatherData {
  city: string
  country: string
  lat: number
  lon: number
  temperature: number
  feelsLike: number
  condition: WeatherCondition
  isDay: boolean
  description: string
  humidity: number
  windSpeed: number
  windDirection: string
  uvIndex: number
  visibility: number
  pressure: number
  sunrise: string
  sunset: string
  localtime: string
  hourly: HourlyWeather[]
  weekly: DailyWeather[]
}
