// lib/weather.ts
// Handles weather fetching, time-of-day detection, and background logic
// WeatherAPI.com free tier — current weather by coordinates

export interface WeatherData {
  temp: number
  condition: string
  conditionCode: number
  icon: string
  isDay: boolean
  location: string
}

export interface TimeOfDay {
  period: 'dawn' | 'morning' | 'golden-hour-am' | 'midday' | 'afternoon' | 'golden-hour-pm' | 'dusk' | 'night' | 'midnight'
  hour: number
  label: string
}

export interface BackgroundConfig {
  gradient: string
  textColor: string
  cardBg: string
  cardBorder: string
  accentColor: string
  secondaryText: string
  dimText: string
}

export type WeatherCategory = 'clear' | 'clear-night' | 'cloudy' | 'overcast' | 'mist' | 'rain' | 'snow' | 'storm'
export type LocationFailure = 'denied' | 'unavailable' | 'timeout' | 'unsupported'
export type LocationResult =
  | { ok: true; location: { lat: number; lon: number } }
  | { ok: false; reason: LocationFailure }

// Detect time of day period based on current hour
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()

  if (hour >= 4 && hour < 6) return { period: 'dawn', hour, label: 'Dawn' }
  if (hour >= 6 && hour < 9) return { period: 'morning', hour, label: 'Morning' }
  if (hour >= 9 && hour < 11) return { period: 'golden-hour-am', hour, label: 'Morning' }
  if (hour >= 11 && hour < 13) return { period: 'midday', hour, label: 'Midday' }
  if (hour >= 13 && hour < 16) return { period: 'afternoon', hour, label: 'Afternoon' }
  if (hour >= 16 && hour < 19) return { period: 'golden-hour-pm', hour, label: 'Golden Hour' }
  if (hour >= 19 && hour < 21) return { period: 'dusk', hour, label: 'Dusk' }
  if (hour >= 21 && hour < 24) return { period: 'night', hour, label: 'Night' }
  return { period: 'midnight', hour, label: 'Midnight' }
}

// Fetch weather through our server route so the provider key stays off the client.
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon) })
    const res = await fetch(`/api/weather?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as WeatherData
  } catch {
    return null
  }
}

// Get user coordinates via browser geolocation while preserving the reason a
// request failed so the UI can offer useful guidance.
export function getUserLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: false, reason: 'unsupported' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        ok: true,
        location: { lat: pos.coords.latitude, lon: pos.coords.longitude },
      }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ ok: false, reason: 'denied' })
        } else if (error.code === error.TIMEOUT) {
          resolve({ ok: false, reason: 'timeout' })
        } else {
          resolve({ ok: false, reason: 'unavailable' })
        }
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 }
    )
  })
}

// WeatherAPI condition codes are identifiers, not a severity-ordered range.
// Keep this map aligned with https://www.weatherapi.com/docs/weather_conditions.json.
const WEATHER_CATEGORIES: Record<number, Exclude<WeatherCategory, 'clear' | 'clear-night'>> = {
  1003: 'cloudy',
  1006: 'cloudy',
  1009: 'overcast',
  1012: 'mist',
  1015: 'mist',
  1018: 'mist',
  1021: 'storm',
  1024: 'storm',
  1027: 'storm',
  1030: 'mist',
  1033: 'mist',
  1036: 'mist',
  1039: 'mist',
  1042: 'mist',
  1045: 'mist',
  1048: 'mist',
  1063: 'rain',
  1066: 'snow',
  1069: 'snow',
  1072: 'rain',
  1087: 'storm',
  1114: 'snow',
  1117: 'snow',
  1135: 'mist',
  1147: 'mist',
  1150: 'rain',
  1153: 'rain',
  1168: 'rain',
  1171: 'rain',
  1180: 'rain',
  1183: 'rain',
  1186: 'rain',
  1189: 'rain',
  1192: 'rain',
  1195: 'rain',
  1198: 'rain',
  1201: 'rain',
  1204: 'snow',
  1207: 'snow',
  1210: 'snow',
  1213: 'snow',
  1216: 'snow',
  1219: 'snow',
  1222: 'snow',
  1225: 'snow',
  1237: 'snow',
  1240: 'rain',
  1243: 'rain',
  1246: 'rain',
  1249: 'snow',
  1252: 'snow',
  1255: 'snow',
  1258: 'snow',
  1261: 'snow',
  1264: 'snow',
  1273: 'storm',
  1276: 'storm',
  1279: 'storm',
  1282: 'storm',
}

export function getWeatherCategory(code: number, isDay: boolean): WeatherCategory {
  if (code === 1000) return isDay ? 'clear' : 'clear-night'
  return WEATHER_CATEGORIES[code] ?? 'cloudy'
}

// Generate background config based on time + weather
export function getBackgroundConfig(time: TimeOfDay, weatherCategory: string): BackgroundConfig {
  // Rain overrides time of day
  if (weatherCategory === 'rain' || weatherCategory === 'storm') {
    return {
      gradient: 'linear-gradient(180deg, #2c3e50 0%, #3d5a73 40%, #4a7a8a 100%)',
      textColor: '#e8f4f8',
      cardBg: 'rgba(255,255,255,0.92)',
      cardBorder: 'rgba(100,150,180,0.2)',
      accentColor: '#4a90b8',
      secondaryText: '#2c4a5a',
      dimText: '#7a9aaa',
    }
  }

  if (weatherCategory === 'snow') {
    return {
      gradient: 'linear-gradient(180deg, #c8d8e8 0%, #dde8f0 50%, #eef2f8 100%)',
      textColor: '#2a3a4a',
      cardBg: 'rgba(255,255,255,0.95)',
      cardBorder: 'rgba(150,180,210,0.3)',
      accentColor: '#5a8aaa',
      secondaryText: '#3a5a6a',
      dimText: '#8aaaba',
    }
  }

  // Time-based gradients
  switch (time.period) {
    case 'dawn':
      return {
        gradient: 'linear-gradient(180deg, #1a1a2e 0%, #4a2040 30%, #8a4a60 60%, #c87a70 100%)',
        textColor: '#f8e8e0',
        cardBg: 'rgba(255,250,248,0.93)',
        cardBorder: 'rgba(180,120,100,0.2)',
        accentColor: '#c87a60',
        secondaryText: '#5a2a30',
        dimText: '#9a6a60',
      }
    case 'morning':
      return {
        gradient: 'linear-gradient(180deg, #87CEEB 0%, #b8dff0 50%, #daeef8 100%)',
        textColor: '#1a3a4a',
        cardBg: 'rgba(255,255,255,0.94)',
        cardBorder: 'rgba(100,170,210,0.25)',
        accentColor: '#3a8ab8',
        secondaryText: '#2a5a7a',
        dimText: '#7aaabb',
      }
    case 'golden-hour-am':
      return {
        gradient: 'linear-gradient(180deg, #78b9da 0%, #b9ddeb 48%, #f7fbfd 100%)',
        textColor: '#18384a',
        cardBg: 'rgba(255,255,255,0.94)',
        cardBorder: 'rgba(92,155,190,0.22)',
        accentColor: '#3a82ad',
        secondaryText: '#28566f',
        dimText: '#739caf',
      }
    case 'midday':
      return {
        gradient: 'linear-gradient(180deg, #4a90d9 0%, #87CEEB 50%, #c8e8f8 100%)',
        textColor: '#0a2a3a',
        cardBg: 'rgba(255,255,255,0.95)',
        cardBorder: 'rgba(80,150,200,0.2)',
        accentColor: '#2a7ab8',
        secondaryText: '#1a4a6a',
        dimText: '#6a9aaa',
      }
    case 'afternoon':
      return {
        gradient: 'linear-gradient(180deg, #5a9ad8 0%, #87CEEB 40%, #d8eef8 100%)',
        textColor: '#1a3a4a',
        cardBg: 'rgba(255,255,255,0.94)',
        cardBorder: 'rgba(90,154,216,0.2)',
        accentColor: '#3a7ab0',
        secondaryText: '#2a5a7a',
        dimText: '#7aaabb',
      }
    case 'golden-hour-pm':
      // The Your Name moment — most important
      return {
        gradient: 'linear-gradient(180deg, #f4a460 0%, #e8834a 30%, #d4603a 60%, #8a3a5a 100%)',
        textColor: '#fff8f0',
        cardBg: 'rgba(255,250,240,0.94)',
        cardBorder: 'rgba(220,140,80,0.25)',
        accentColor: '#d4603a',
        secondaryText: '#5a2a10',
        dimText: '#aa7a50',
      }
    case 'dusk':
      return {
        gradient: 'linear-gradient(180deg, #4a3a6a 0%, #6a4a8a 30%, #8a5a7a 60%, #aa7a60 100%)',
        textColor: '#f0e8f8',
        cardBg: 'rgba(255,252,255,0.93)',
        cardBorder: 'rgba(150,100,180,0.2)',
        accentColor: '#8a5aaa',
        secondaryText: '#3a2a5a',
        dimText: '#8a7aaa',
      }
    case 'night':
      return {
        gradient: 'linear-gradient(180deg, #0a0a2a 0%, #1a1a4a 40%, #0a2a4a 100%)',
        textColor: '#e8eef8',
        cardBg: 'rgba(255,255,255,0.90)',
        cardBorder: 'rgba(100,130,180,0.2)',
        accentColor: '#5a7ab8',
        secondaryText: '#2a3a5a',
        dimText: '#6a7a9a',
      }
    case 'midnight':
      return {
        gradient: 'linear-gradient(180deg, #050510 0%, #0a0a20 60%, #050515 100%)',
        textColor: '#d8ddf0',
        cardBg: 'rgba(255,255,255,0.88)',
        cardBorder: 'rgba(80,100,150,0.2)',
        accentColor: '#4a6ab0',
        secondaryText: '#1a2a4a',
        dimText: '#5a6a8a',
      }
    default:
      return {
        gradient: 'linear-gradient(180deg, #87CEEB 0%, #c8e8f8 100%)',
        textColor: '#1a3a4a',
        cardBg: 'rgba(255,255,255,0.94)',
        cardBorder: 'rgba(100,170,210,0.25)',
        accentColor: '#3a8ab8',
        secondaryText: '#2a5a7a',
        dimText: '#7aaabb',
      }
  }
}

// Format weather for display on entry
export function formatWeatherStamp(weather: WeatherData): string {
  return `${weather.temp}° · ${weather.condition}`
}
