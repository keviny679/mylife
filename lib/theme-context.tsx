'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

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
  }
}

type Mode = 'fire' | 'rain'

const ThemeContext = createContext<{
  mode: Mode
  toggleMode: () => void
  t: typeof themes.fire
}>({
  mode: 'fire',
  toggleMode: () => {},
  t: themes.fire,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mylife-theme') as Mode) || 'fire'
    }
    return 'fire'
  })

  function toggleMode() {
    setMode((prev) => {
      const next = prev === 'fire' ? 'rain' : 'fire'
      localStorage.setItem('mylife-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, t: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}