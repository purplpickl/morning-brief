'use client'

import { useEffect, useState } from 'react'

interface HourlySlot {
  time: string
  temp: number
  feelsLike: number
  precipChance: number
  code: number
}

interface WeatherData {
  current: { temp: number; feelsLike: number; precip: number; code: number }
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
  if (code <= 82) return 'Showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'
  return ''
}

function formatHour(timeStr: string): string {
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  const data = await res.json()
  const nowH = new Date().getHours()

  const hourly: HourlySlot[] = data.hourly.time
    .map((t: string, i: number) => ({
      time: t,
      temp: Math.round(data.hourly.temperature_2m[i]),
      feelsLike: Math.round(data.hourly.apparent_temperature[i]),
      precipChance: data.hourly.precipitation_probability[i],
      code: data.hourly.weather_code[i],
    }))
    .filter((_: HourlySlot, i: number) => i >= nowH && i < nowH + 12)

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
  const [error, setError] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          setWeather(await fetchWeather(pos.coords.latitude, pos.coords.longitude))
        } catch {
          setError(true)
        }
      },
      () => setError(true)
    )
  }, [])

  if (error) return <p className="font-label text-xs text-muted">Location unavailable.</p>

  if (!weather) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-ink/10 rounded" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-ink/10 rounded" />)}
        </div>
      </div>
    )
  }

  const { current, hourly } = weather

  return (
    <div>
      {/* Current conditions */}
      <div
        className="flex items-center justify-between pb-3 mb-3"
        style={{ borderBottom: '1px solid rgba(236,228,211,0.25)' }}
      >
        <div>
          <div className="flex items-end gap-2">
            <span
              className="font-editorial font-semibold text-ink leading-none"
              style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
            >
              {current.temp}°
            </span>
          </div>
          <p className="font-label text-[11px] text-muted mt-1">
            {weatherDesc(current.code)} · Feels {current.feelsLike}°
          </p>
        </div>
        <span className="text-4xl">{weatherIcon(current.code)}</span>
      </div>

      {/* Hourly — 4-col wrapping grid (newspaper card style) */}
      <div className="grid grid-cols-4 gap-1.5">
        {hourly.map((slot, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 py-2"
            style={{ border: '1px solid rgba(236,228,211,0.18)' }}
          >
            <span className="font-label text-[9px] text-muted">
              {i === 0 ? 'Now' : formatHour(slot.time)}
            </span>
            <span className="text-sm">{weatherIcon(slot.code)}</span>
            <span className="font-editorial text-sm font-semibold text-ink">{slot.temp}°</span>
            {slot.precipChance > 0 && (
              <span className="font-label text-[9px] text-blue-400">{slot.precipChance}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
