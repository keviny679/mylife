import type { WeatherData } from '@/lib/weather'

function parseCoordinate(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === '') return null

  const coordinate = Number(value)
  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) return null

  return coordinate
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const lat = parseCoordinate(url.searchParams.get('lat'), -90, 90)
  const lon = parseCoordinate(url.searchParams.get('lon'), -180, 180)

  if (lat === null || lon === null) {
    return Response.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 })
  }

  // Support the existing local configuration while deployments migrate to the
  // server-only variable. This value is never returned to the browser.
  const key = process.env.WEATHER_API_KEY ?? process.env.NEXT_PUBLIC_WEATHER_API_KEY
  if (!key) {
    return Response.json({ error: 'Weather service is not configured.' }, { status: 503 })
  }

  try {
    const weatherUrl = new URL('https://api.weatherapi.com/v1/current.json')
    weatherUrl.searchParams.set('key', key)
    weatherUrl.searchParams.set('q', `${lat},${lon}`)
    weatherUrl.searchParams.set('aqi', 'no')

    const response = await fetch(weatherUrl, { cache: 'no-store' })
    if (!response.ok) {
      return Response.json({ error: 'Weather service request failed.' }, { status: 502 })
    }

    const data = await response.json()
    const weather: WeatherData = {
      temp: Math.round(data.current.temp_f),
      condition: data.current.condition.text,
      conditionCode: data.current.condition.code,
      icon: data.current.condition.icon,
      isDay: data.current.is_day === 1,
      location: `${data.location.name}, ${data.location.region}`,
    }

    return Response.json(weather)
  } catch {
    return Response.json({ error: 'Weather service is unavailable.' }, { status: 502 })
  }
}
