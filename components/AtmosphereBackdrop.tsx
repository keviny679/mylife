'use client'

import { useWeather } from '@/lib/weather-context'

export default function AtmosphereBackdrop() {
  const { background } = useWeather()

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: background.gradient,
        transition: 'background 2s ease',
      }}
    />
  )
}
