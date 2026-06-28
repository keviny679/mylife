'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export const themes = {
  arcadia: {
    bg: '#281A17',
    glow1: 'rgba(255,188,80,0.14)',
    glow2: 'rgba(54,187,217,0.08)',
    glow3: 'rgba(207,97,32,0.10)',
    cardBg: '#34241F',
    cardBorder: '#4a3028',
    entryBg: '#2e1e1a',
    entryBorder: '#3d2820',
    accent: '#36BBD9',
    accentStrong: '#1a8aaa',
    textMuted: '#e0c4a0',
    textFaint: '#b09070',
    textDim: '#806040',
    inputBg: '#34241F',
    inputText: '#f8e8d0',
    bodyText: '#e8d0a8',
    entryBodyText: '#c0a070',
    shadow: 'rgba(0,0,0,0.35)',
    prompt: 'what stayed with you today',
  },
rain: {
    bg: '#111820',
    glow1: 'rgba(80,130,160,0.16)',
    glow2: 'rgba(60,100,130,0.12)',
    glow3: 'rgba(50,90,120,0.10)',
    cardBg: '#182028',
    cardBorder: '#2a3d4a',
    entryBg: '#141e28',
    entryBorder: '#223040',
    accent: '#6a9fb5',
    accentStrong: '#3d7a96',
    textMuted: '#d8e8f0',
    textFaint: '#90aabb',
    textDim: '#506878',
    inputBg: '#182028',
    inputText: '#edf4f8',
    bodyText: '#d0e2ec',
    entryBodyText: '#90b0c4',
    shadow: 'rgba(0,0,0,0.45)',
    prompt: 'the day is behind you now',
  },
  firelight: {
    bg: '#1B1510',
    glow1: 'rgba(217,138,63,0.14)',
    glow2: 'rgba(150,60,40,0.10)',
    glow3: 'rgba(200,100,30,0.10)',
    cardBg: '#261D15',
    cardBorder: '#3d2c1a',
    entryBg: '#201810',
    entryBorder: '#302015',
    accent: '#D68A4F',
    accentStrong: '#a05828',
    textMuted: '#e8cfa0',
    textFaint: '#b89060',
    textDim: '#806038',
    inputBg: '#261D15',
    inputText: '#F5E8D0',
    bodyText: '#e0c898',
    entryBodyText: '#b89060',
    shadow: 'rgba(0,0,0,0.4)',
    prompt: 'just you and the page',
  },
  dawn: {
    bg: '#1E1D24',
    glow1: 'rgba(224,168,160,0.14)',
    glow2: 'rgba(120,120,165,0.10)',
    glow3: 'rgba(200,140,130,0.08)',
    cardBg: '#29282F',
    cardBorder: '#3a3545',
    entryBg: '#242230',
    entryBorder: '#302e3e',
    accent: '#D6A08C',
    accentStrong: '#a06850',
    textMuted: '#e0d0d8',
    textFaint: '#a890a0',
    textDim: '#706078',
    inputBg: '#29282F',
    inputText: '#F0EBF0',
    bodyText: '#ddd0d8',
    entryBodyText: '#b0a0b0',
    shadow: 'rgba(0,0,0,0.38)',
    prompt: 'before the world wakes',
  },
  dusk: {
    bg: '#1C1620',
    glow1: 'rgba(154,77,114,0.14)',
    glow2: 'rgba(72,76,142,0.10)',
    glow3: 'rgba(130,60,100,0.10)',
    cardBg: '#261D2A',
    cardBorder: '#38284a',
    entryBg: '#201828',
    entryBorder: '#2e2038',
    accent: '#B083A0',
    accentStrong: '#7a4870',
    textMuted: '#ddd0e0',
    textFaint: '#a888b0',
    textDim: '#706080',
    inputBg: '#261D2A',
    inputText: '#F0E8F0',
    bodyText: '#e0d0e0',
    entryBodyText: '#b898c0',
    shadow: 'rgba(0,0,0,0.4)',
    prompt: 'let the day settle',
  },
  midnight: {
    bg: '#0F1318',
    glow1: 'rgba(60,72,120,0.14)',
    glow2: 'rgba(40,82,98,0.10)',
    glow3: 'rgba(50,68,110,0.10)',
    cardBg: '#171D23',
    cardBorder: '#252f3d',
    entryBg: '#121820',
    entryBorder: '#1e2a34',
    accent: '#7C89B0',
    accentStrong: '#485a88',
    textMuted: '#c8d4e0',
    textFaint: '#8898aa',
    textDim: '#506070',
    inputBg: '#171D23',
    inputText: '#E8EEF4',
    bodyText: '#d0dce8',
    entryBodyText: '#98aabb',
    shadow: 'rgba(0,0,0,0.45)',
    prompt: 'everyone else is asleep',
  },
  sky: {
    bg: '#EEF2F7',
    glow1: 'rgba(255,200,100,0.12)',
    glow2: 'rgba(100,150,200,0.10)',
    glow3: 'rgba(180,210,240,0.14)',
    cardBg: '#F8FAFB',
    cardBorder: '#C8D4E4',
    entryBg: '#F2F6FA',
    entryBorder: '#BDC9DA',
    accent: '#5B8DB8',
    accentStrong: '#3A6A94',
    textMuted: '#2A3D54',
    textFaint: '#5A7090',
    textDim: '#8AA0B8',
    inputBg: '#F8FAFB',
    inputText: '#111E2C',
    bodyText: '#1E3044',
    entryBodyText: '#4A6080',
    shadow: 'rgba(100,140,180,0.15)',
    prompt: 'the afternoon is yours',
  },
}

export type Mode = 'arcadia' | 'rain' | 'firelight' | 'dawn' | 'dusk' | 'midnight' | 'sky'

export const modeOptions: { mode: Mode; emoji: string; label: string }[] = [
  { mode: 'arcadia', emoji: '📷', label: 'Arcadia' },
  { mode: 'rain', emoji: '🌧', label: 'Rain' },
  { mode: 'firelight', emoji: '🔥', label: 'Firelight' },
  { mode: 'dawn', emoji: '🌸', label: 'Dawn' },
  { mode: 'dusk', emoji: '🌆', label: 'Dusk' },
  { mode: 'midnight', emoji: '🌙', label: 'Midnight' },
  { mode: 'sky', emoji: '☁️', label: 'Sky' },
]

const ThemeContext = createContext<{
  mode: Mode
  setMode: (mode: Mode) => void
  t: typeof themes.rain
}>({
  mode: 'rain',
  setMode: () => {},
  t: themes.rain,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('rain')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mylife-theme') as Mode
    if (saved && themes[saved]) {
      setModeState(saved)
    }
    setMounted(true)
  }, [])

  function setMode(next: Mode) {
    setModeState(next)
    localStorage.setItem('mylife-theme', next)
  }

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ mode: 'rain', setMode, t: themes.rain }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, t: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}