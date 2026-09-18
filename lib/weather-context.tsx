'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
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
  locationStatus: 'checking' | 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'error'
  locationMessage: string
  requestLocation: () => Promise<void>
}

// Server rendering runs in the deployment region's timezone while the journal
// must follow the reader's browser. Start both server and client from the same
// deterministic value, then replace it with local time after hydration. This
// avoids React preserving a mismatched server-rendered background style.
const defaultTime: TimeOfDay = { period: 'morning', hour: 8, label: 'Morning' }
const defaultBg = getBackgroundConfig(defaultTime, 'clear')

const WeatherContext = createContext<WeatherContextType>({
  weather: null,
  timeOfDay: defaultTime,
  background: defaultBg,
  location: null,
  cityName: '',
  locationStatus: 'checking',
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
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(defaultTime)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [cityName, setCityName] = useState<string>('')
  const [locationStatus, setLocationStatus] = useState<WeatherContextType['locationStatus']>('checking')
  const [locationMessage, setLocationMessage] = useState('')

  const background = useMemo(() => {
    const category = weather
      ? getWeatherCategory(weather.conditionCode, weather.isDay)
      : 'clear'
    return getBackgroundConfig(timeOfDay, category)
  }, [timeOfDay, weather])

  // Time and weather are the only theme inputs. Keeping the background derived
  // prevents route transitions or competing effects from restoring stale colors.
  useEffect(() => {
    function tick() {
      setTimeOfDay(getTimeOfDay())
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  // Load saved location from profile on mount
  useEffect(() => {
    async function loadSavedLocation() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLocationStatus('idle')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single()

      if (error || profile?.latitude == null || profile?.longitude == null) {
        setLocationStatus('idle')
        return
      }

      setLocationStatus('loading')
      const loc = { lat: profile.latitude, lon: profile.longitude }
      setLocation(loc)

      // Location naming and weather are independent network requests.
      const [city, w] = await Promise.all([
        reverseGeocode(loc.lat, loc.lon),
        fetchWeather(loc.lat, loc.lon),
      ])
      setCityName(city)

      if (w) {
        setWeather(w)
        setLocationStatus('ready')
        setLocationMessage('')
      } else {
        setLocationStatus('error')
        setLocationMessage('Weather is unavailable right now. Tap to try again.')
      }
    }
    loadSavedLocation()
  }, [])

  // Refresh conditions in place so a long-lived tab does not keep the weather
  // (and therefore the atmosphere) from the time it was first opened.
  useEffect(() => {
    if (!location) return

    const interval = setInterval(async () => {
      const nextWeather = await fetchWeather(location.lat, location.lon)
      if (nextWeather) setWeather(nextWeather)
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [location])

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
