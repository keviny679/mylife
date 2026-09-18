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
  locationStatus: 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'error'
  locationMessage: string
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
  locationStatus: 'idle',
  locationMessage: '',
  requestLocation: async () => {},
})

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    )
    if (!res.ok) return ''

    const data: unknown = await res.json()
    if (!data || typeof data !== 'object') return ''

    const place = data as {
      city?: string
      locality?: string
      principalSubdivisionCode?: string
      principalSubdivision?: string
      localityInfo?: { administrative?: Array<{ name?: string }> }
    }
    const city = place.city || place.locality || place.localityInfo?.administrative?.[3]?.name || ''
    const state = place.principalSubdivisionCode?.replace('US-', '') || place.principalSubdivision || ''
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
  const [locationStatus, setLocationStatus] = useState<WeatherContextType['locationStatus']>('idle')
  const [locationMessage, setLocationMessage] = useState('')

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

      if (profile?.latitude != null && profile?.longitude != null) {
        setLocationStatus('loading')
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
          setLocationStatus('ready')
          setLocationMessage('')
        } else {
          setLocationStatus('error')
          setLocationMessage('Weather is unavailable right now. Tap to try again.')
        }
      }
    }
    loadSavedLocation()
  }, [])

  async function requestLocation() {
    setLocationStatus('loading')
    let loc = location

    // A weather retry should reuse coordinates we already have. Only invoke
    // the browser permission flow when location has not been collected yet.
    if (!loc) {
      setLocationMessage('Finding your location…')
      const result = await getUserLocation()
      if (!result.ok) {
        if (result.reason === 'denied') {
          setLocationStatus('denied')
          setLocationMessage('Location is blocked. Allow it in your browser settings to add local weather.')
        } else if (result.reason === 'timeout') {
          setLocationStatus('unavailable')
          setLocationMessage('Location took too long. Tap to try again.')
        } else if (result.reason === 'unsupported') {
          setLocationStatus('unavailable')
          setLocationMessage('This browser does not support location.')
        } else {
          setLocationStatus('unavailable')
          setLocationMessage('Your location could not be found. Tap to try again.')
        }
        return
      }

      loc = result.location
      setLocation(loc)

      // Reverse geocode for accurate city name
      const city = await reverseGeocode(loc.lat, loc.lon)
      setCityName(city)

      // Save newly granted coordinates to the profile.
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles')
          .update({ latitude: loc.lat, longitude: loc.lon })
          .eq('id', user.id)
      }
    } else {
      setLocationMessage('Refreshing local weather…')
    }

    // Fetch weather
    const w = await fetchWeather(loc.lat, loc.lon)
    if (w) {
      setWeather(w)
      const time = getTimeOfDay()
      setBackground(getBackgroundConfig(time, getWeatherCategory(w.conditionCode, w.isDay)))
      setLocationStatus('ready')
      setLocationMessage('')
    } else {
      setLocationStatus('error')
      setLocationMessage('Weather is unavailable right now. Tap to try again.')
    }
  }

  return (
    <WeatherContext.Provider value={{
      weather,
      timeOfDay,
      background,
      location,
      cityName,
      locationStatus,
      locationMessage,
      requestLocation,
    }}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  return useContext(WeatherContext)
}
