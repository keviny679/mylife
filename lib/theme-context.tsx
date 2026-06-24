'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export const themes = {
  fire: {
    bg: '#140d05',
    glow1: 'rgba(255,100,20,0.07)',
    glow2: 'rgba(255,140,30,0.05)',
    glow3: 'rgba(220,80,10,0.06)',
    cardBg: '#1c1007',
    cardBorder: '#3b2410',
    entryBg: '#180e06',
    entryBorder: '#2a1a0a',
    accent: '#e8956d',
    accentStrong: '#c45e2a',
    textMuted: '#8a6b4a',
    textFaint: '#5c4530',
    textDim: '#4a3520',
    inputBg: '#140d05',
    inputText: '#f0d4b0',
    bodyText: '#c4a882',
    entryBodyText: '#9c7c54',
  },
  rain: {
    bg: '#0b1014',
    glow1: 'rgba(90,130,160,0.07)',
    glow2: 'rgba(110,150,180,0.05)',
    glow3: 'rgba(70,110,140,0.06)',
    cardBg: '#101820',
    cardBorder: '#23323d',
    entryBg: '#0d1620',
    entryBorder: '#1a2730',
    accent: '#8fb8d4',
    accentStrong: '#3d7ea6',
    textMuted: '#7a92a0',
    textFaint: '#566a76',
    textDim: '#445560',
    inputBg: '#0b1014',
    inputText: '#cfe2ec',
    bodyText: '#a8c0cc',
    entryBodyText: '#85a0ad',
  },
midnight: {
    bg: '#05070f',
    glow1: 'rgba(220,230,255,0.04)',
    glow2: 'rgba(180,200,240,0.03)',
    glow3: 'rgba(200,215,255,0.04)',
    cardBg: '#090c18',
    cardBorder: '#181f35',
    entryBg: '#070a14',
    entryBorder: '#10162a',
    accent: '#e2e8ff',
    accentStrong: '#6b7fc4',
    textMuted: '#8890b8',
    textFaint: '#565e88',
    textDim: '#383f60',
    inputBg: '#05070f',
    inputText: '#f0f2ff',
    bodyText: '#c0c8e8',
    entryBodyText: '#8890b8',
  },
forest: {
    bg: '#030a05',
    glow1: 'rgba(30,80,40,0.10)',
    glow2: 'rgba(50,100,50,0.07)',
    glow3: 'rgba(40,90,45,0.06)',
    cardBg: '#071008',
    cardBorder: '#173520',
    entryBg: '#050d06',
    entryBorder: '#102818',
    accent: '#7ec896',
    accentStrong: '#2d8a50',
    textMuted: '#6a9470',
    textFaint: '#486050',
    textDim: '#304038',
    inputBg: '#030a05',
    inputText: '#d8f0e0',
    bodyText: '#a0c8a8',
    entryBodyText: '#789878',
  },
  sky: {
    bg: '#f0f7ff',
    glow1: 'rgba(96,165,250,0.12)',
    glow2: 'rgba(147,197,253,0.10)',
    glow3: 'rgba(59,130,246,0.08)',
    cardBg: '#ffffff',
    cardBorder: '#bfdbfe',
    entryBg: '#f8fbff',
    entryBorder: '#dbeafe',
    accent: '#2563eb',
    accentStrong: '#1d4ed8',
    textMuted: '#475569',
    textFaint: '#94a3b8',
    textDim: '#cbd5e1',
    inputBg: '#ffffff',
    inputText: '#1e293b',
    bodyText: '#334155',
    entryBodyText: '#64748b',
  }
}

export type Mode = 'fire' | 'rain' | 'midnight' | 'forest' | 'sky'

export const modeOptions: { mode: Mode; emoji: string; label: string }[] = [
  { mode: 'fire', emoji: '🔥', label: 'Firelight' },
  { mode: 'rain', emoji: '🌧', label: 'Rain' },
  { mode: 'midnight', emoji: '🌙', label: 'Midnight' },
  { mode: 'forest', emoji: '🌿', label: 'Forest' },
  { mode: 'sky', emoji: '☁️', label: 'Sky' },
]

const ThemeContext = createContext<{
  mode: Mode
  setMode: (mode: Mode) => void
  t: typeof themes.fire
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