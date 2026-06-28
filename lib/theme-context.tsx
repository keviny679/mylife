'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export const themes = {
  nostalgic: {
    bg: '#281A17',
    glow1: 'rgba(255,188,80,0.12)',
    glow2: 'rgba(54,187,217,0.07)',
    glow3: 'rgba(207,97,32,0.08)',
    cardBg: '#34241F',
    cardBorder: '#4a3028',
    entryBg: '#2e1e1a',
    entryBorder: '#3d2820',
    accent: '#36BBD9',
    accentStrong: '#1a8aaa',
    textMuted: '#c8a882',
    textFaint: '#8a6848',
    textDim: '#5a4030',
    inputBg: '#34241F',
    inputText: '#f0dfc0',
    bodyText: '#d4b890',
    entryBodyText: '#a08060',
    shadow: 'rgba(0,0,0,0.35)',
    prompt: 'what stayed with you today',
  },
  rain: {
    bg: '#151B20',
    glow1: 'rgba(94,134,154,0.12)',
    glow2: 'rgba(70,105,125,0.08)',
    glow3: 'rgba(54,100,130,0.07)',
    cardBg: '#1D262C',
    cardBorder: '#2a363e',
    entryBg: '#192028',
    entryBorder: '#243040',
    accent: '#86A6B4',
    accentStrong: '#4a7a94',
    textMuted: '#9ab0bc',
    textFaint: '#5e7a88',
    textDim: '#3a5060',
    inputBg: '#1D262C',
    inputText: '#D3DBDE',
    bodyText: '#b0c4cc',
    entryBodyText: '#7a9aaa',
    shadow: 'rgba(0,0,0,0.4)',
    prompt: 'the day is behind you now',
  },
  firelight: {
    bg: '#1B1510',
    glow1: 'rgba(217,138,63,0.12)',
    glow2: 'rgba(150,60,40,0.09)',
    glow3: 'rgba(200,100,30,0.08)',
    cardBg: '#261D15',
    cardBorder: '#3a2818',
    entryBg: '#201810',
    entryBorder: '#2e2015',
    accent: '#D68A4F',
    accentStrong: '#a05828',
    textMuted: '#c8a070',
    textFaint: '#8a6840',
    textDim: '#5a4025',
    inputBg: '#261D15',
    inputText: '#ECDFCE',
    bodyText: '#d0b888',
    entryBodyText: '#a07848',
    shadow: 'rgba(0,0,0,0.4)',
    prompt: 'just you and the page',
  },
  dawn: {
    bg: '#1E1D24',
    glow1: 'rgba(224,168,160,0.12)',
    glow2: 'rgba(120,120,165,0.08)',
    glow3: 'rgba(200,140,130,0.07)',
    cardBg: '#29282F',
    cardBorder: '#38343e',
    entryBg: '#242230',
    entryBorder: '#302e3e',
    accent: '#D6A08C',
    accentStrong: '#a06850',
    textMuted: '#b8a8b0',
    textFaint: '#7a6878',
    textDim: '#504858',
    inputBg: '#29282F',
    inputText: '#E8E3E3',
    bodyText: '#c8bcc0',
    entryBodyText: '#908490',
    shadow: 'rgba(0,0,0,0.38)',
    prompt: 'before the world wakes',
  },
  dusk: {
    bg: '#1C1620',
    glow1: 'rgba(154,77,114,0.12)',
    glow2: 'rgba(72,76,142,0.09)',
    glow3: 'rgba(130,60,100,0.08)',
    cardBg: '#261D2A',
    cardBorder: '#362840',
    entryBg: '#201828',
    entryBorder: '#2c2038',
    accent: '#B083A0',
    accentStrong: '#7a4870',
    textMuted: '#b898b0',
    textFaint: '#786080',
    textDim: '#504058',
    inputBg: '#261D2A',
    inputText: '#E7DEE3',
    bodyText: '#c8b8c4',
    entryBodyText: '#988098',
    shadow: 'rgba(0,0,0,0.4)',
    prompt: 'let the day settle',
  },
  midnight: {
    bg: '#0F1318',
    glow1: 'rgba(60,72,120,0.12)',
    glow2: 'rgba(40,82,98,0.09)',
    glow3: 'rgba(50,68,110,0.08)',
    cardBg: '#171D23',
    cardBorder: '#222c38',
    entryBg: '#121820',
    entryBorder: '#1c2830',
    accent: '#7C89B0',
    accentStrong: '#485a88',
    textMuted: '#9aaab8',
    textFaint: '#5a6878',
    textDim: '#384858',
    inputBg: '#171D23',
    inputText: '#D5DADE',
    bodyText: '#b0bcc8',
    entryBodyText: '#788898',
    shadow: 'rgba(0,0,0,0.45)',
    prompt: 'everyone else is asleep',
  },
}

export type Mode = 'nostalgic' | 'rain' | 'firelight' | 'dawn' | 'dusk' | 'midnight'

export const modeOptions: { mode: Mode; emoji: string; label: string }[] = [
  { mode: 'nostalgic', emoji: '📷', label: 'Nostalgic' },
  { mode: 'rain', emoji: '🌧', label: 'Rain' },
  { mode: 'firelight', emoji: '🔥', label: 'Firelight' },
  { mode: 'dawn', emoji: '🌸', label: 'Dawn' },
  { mode: 'dusk', emoji: '🌆', label: 'Dusk' },
  { mode: 'midnight', emoji: '🌙', label: 'Midnight' },
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