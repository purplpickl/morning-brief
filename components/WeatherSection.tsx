'use client'

import { useEffect, useState } from 'react'

interface HourlySlot {
  time: string
  temp: number
  feelsLike: number
  precipChance: number
  precip: number
  code: number
}

interface WeatherData {
  current: {
    temp: number
    feelsLike: number
    precip: number
    code: number
  }
  hourly: HourlySlot[]
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function weatherDesc(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Partly cloudy'
  if (code <= 3) return 'Overcast'
  if (code <= 48) return 'Foggy'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'
  return ''
}

function formatHour(timeStr: string): string {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  const data = await res.json()

  const now = new Date()
  const currentHour = now.getHours()

  const hourly: HourlySlot[] = data.hourly.time
    .map((t: string, i: number) => ({
      time: t,
      temp: Math.round(data.hourly.temperature_2m[i]),
      feelsLike: Math.round(data.hourly.apparent_temperature[i]),
      precipChance: data.hourly.precipitation_probability[i],
      precip: data.hourly.precipitation[i],
      code: data.hourly.weather_code[i],
    }))
    .filter((_: HourlySlot, i: number) => i >= currentHour && i < currentHour + 12)

  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      precip: data.current.precipitation,
      code: data.current.weather_code,
    },
    hourly,
  }
}

export default function WeatherSection() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude)
          setWeather(data)
        } catch {
          setError('Could not load weather.')
        }
      },
      () => setError('Location access denied.')
    )
  }, [])

  if (error) return null

  if (!weather) {
    return (
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Weather</h2>
        <div className="bg-gray-900 rounded-xl px-4 py-4 animate-pulse h-24" />
      </section>
    )
  }

  const { current, hourly } = weather

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Weather</h2>

      {/* Current conditions */}
      <div className="bg-gray-900 rounded-xl px-4 py-4 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold text-white">{current.temp}°</span>
              <span className="text-gray-400 text-sm mb-1">Feels like {current.feelsLike}°</span>
            </div>
            <p className="text-gray-400 text-sm mt-0.5">{weatherDesc(current.code)}</p>
            {current.precip > 0 && (
              <p className="text-blue-400 text-xs mt-1">{current.precip}" precipitation now</p>
            )}
          </div>
          <span className="text-5xl">{weatherIcon(current.code)}</span>
        </div>
      </div>

      {/* Hourly scroll */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          {hourly.map((slot, i) => (
            <div key={i} className="bg-gray-900 rounded-xl px-3 py-3 flex flex-col items-center gap-1 min-w-[72px]">
              <span className="text-gray-400 text-xs">{i === 0 ? 'Now' : formatHour(slot.time)}</span>
              <span className="text-lg">{weatherIcon(slot.code)}</span>
              <span className="text-white text-sm font-medium">{slot.temp}°</span>
              <span className="text-gray-500 text-xs">FL {slot.feelsLike}°</span>
              {slot.precipChance > 0 && (
                <span className="text-blue-400 text-xs">{slot.precipChance}%</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
