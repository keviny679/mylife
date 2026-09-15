'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  WeatherData,
  TimeOfDay,
  BackgroundConfig,
  fetchWeather,
  getTimeOfDay,
  getWeatherCategory,
  getBackgroundConfig,
  getUserLocation,
} from '@/lib/weather'
import { supabase } from '@/lib/supabase'

interface WeatherContextType {
  weather: WeatherData | null
  timeOfDay: TimeOfDay
  background: BackgroundConfig
  location: { lat: number; lon: number } | null
  cityName: string
  requestLocation: () => Promise<void>
}

const defaultTime = getTimeOfDay()
const defaultBg = getBackgroundConfig(defaultTime, 'clear')

const WeatherContext = createContext<WeatherContextType>({
  weather: null,
  timeOfDay: defaultTime,
  background: defaultBg,
  location: null,
  cityName: '',
  requestLocation: async () => {},
})

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    )
    const data = await res.json()
    const city = data.city || data.locality || data.localityInfo?.administrative?.[3]?.name || ''
    const state = data.principalSubdivisionCode?.replace('US-', '') || data.principalSubdivision || ''
    if (city && state) return `${city}, ${state}`
    if (city) return city
    if (state) return state
    return ''
  } catch {
    return ''
  }
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay())
  const [background, setBackground] = useState<BackgroundConfig>(defaultBg)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [cityName, setCityName] = useState<string>('')

  // Update time every minute
  useEffect(() => {
    function tick() {
      const time = getTimeOfDay()
      setTimeOfDay(time)
      const category = weather
        ? getWeatherCategory(weather.conditionCode, weather.isDay)
        : 'clear'
      setBackground(getBackgroundConfig(time, category))
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [weather])

  // Load saved location from profile on mount
  useEffect(() => {
    async function loadSavedLocation() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single()

      if (profile?.latitude && profile?.longitude) {
        const loc = { lat: profile.latitude, lon: profile.longitude }
        setLocation(loc)

        // Reverse geocode for accurate city name
        const city = await reverseGeocode(loc.lat, loc.lon)
        setCityName(city)

        const w = await fetchWeather(loc.lat, loc.lon)
        if (w) {
          setWeather(w)
          const time = getTimeOfDay()
          setBackground(getBackgroundConfig(time, getWeatherCategory(w.conditionCode, w.isDay)))
        }
      }
    }
    loadSavedLocation()
  }, [])

  async function requestLocation() {
    const loc = await getUserLocation()
    if (!loc) return
    setLocation(loc)

    // Reverse geocode for accurate city name
    const city = await reverseGeocode(loc.lat, loc.lon)
    setCityName(city)

    // Save to profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles')
        .update({ latitude: loc.lat, longitude: loc.lon })
        .eq('id', user.id)
    }

    // Fetch weather
    const w = await fetchWeather(loc.lat, loc.lon)
    if (w) {
      setWeather(w)
      const time = getTimeOfDay()
      setBackground(getBackgroundConfig(time, getWeatherCategory(w.conditionCode, w.isDay)))
    }
  }

  return (
    <WeatherContext.Provider value={{ weather, timeOfDay, background, location, cityName, requestLocation }}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  return useContext(WeatherContext)
}