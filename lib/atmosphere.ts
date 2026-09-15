'use client'

import { useWeather } from '@/lib/weather-context'

// A compatibility palette for surfaces that predate the weather-driven design.
// New UI should prefer `background` directly; `t` keeps existing paper/card
// layouts visually aligned while those pages are gradually decomposed.
export function useAtmosphere() {
  const { background } = useWeather()

  return {
    background,
    t: {
      bg: background.gradient,
      glow1: 'rgba(255,255,255,0.08)',
      glow2: 'rgba(255,255,255,0.05)',
      glow3: 'rgba(255,255,255,0.06)',
      cardBg: background.cardBg,
      cardBorder: background.cardBorder,
      entryBg: background.cardBg,
      entryBorder: background.cardBorder,
      accent: background.accentColor,
      accentStrong: background.accentColor,
      textMuted: background.secondaryText,
      textFaint: background.dimText,
      textDim: background.dimText,
      inputBg: background.cardBg,
      inputText: background.secondaryText,
      bodyText: background.secondaryText,
      entryBodyText: background.dimText,
      shadow: 'rgba(20,35,50,0.18)',
    },
  }
}
