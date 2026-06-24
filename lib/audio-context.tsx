'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

export interface Track {
  id: number
  title: string
  file: string
}

export const playlist: Track[] = [
  { id: 1, title: 'I Gave It My All', file: '/audio/i gave it my all.mp3' },
  { id: 2, title: 'Distant Thunder', file: '/audio/rain-2.mp3' },
  { id: 3, title: 'Evening Downpour', file: '/audio/rain-3.mp3' },
  { id: 4, title: 'Soft Drizzle', file: '/audio/rain-4.mp3' },
  { id: 5, title: 'Storm at Night', file: '/audio/rain-5.mp3' },
  { id: 6, title: 'Window Rain', file: '/audio/rain-6.mp3' },
  { id: 7, title: 'Forest Rain', file: '/audio/rain-7.mp3' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface AudioContextType {
  isPlaying: boolean
  currentTrack: Track
  togglePlay: () => void
  skipNext: () => void
  skipPrev: () => void
  toggleShuffle: () => void
  isShuffled: boolean
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  currentTrack: playlist[0],
  togglePlay: () => {},
  skipNext: () => {},
  skipPrev: () => {},
  toggleShuffle: () => {},
  isShuffled: true,
})

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(true)
  const [queue, setQueue] = useState<Track[]>(() => shuffleArray(playlist))
  const [queueIndex, setQueueIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = queue[queueIndex]

  useEffect(() => {
    audioRef.current = new Audio(currentTrack.file)
    audioRef.current.addEventListener('ended', handleTrackEnd)

    return () => {
      audioRef.current?.pause()
      audioRef.current?.removeEventListener('ended', handleTrackEnd)
    }
  }, [queueIndex, queue])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, queueIndex, queue])

  function handleTrackEnd() {
    goToNext()
  }

  function goToNext() {
    setQueueIndex((prev) => {
      if (prev + 1 >= queue.length) {
        setQueue(shuffleArray(playlist))
        return 0
      }
      return prev + 1
    })
  }

  function goToPrev() {
    setQueueIndex((prev) => (prev - 1 + queue.length) % queue.length)
  }

  function togglePlay() {
    setIsPlaying((prev) => !prev)
  }

  function skipNext() {
    goToNext()
  }

  function skipPrev() {
    goToPrev()
  }

  function toggleShuffle() {
    setIsShuffled((prev) => {
      if (!prev) {
        setQueue(shuffleArray(playlist))
        setQueueIndex(0)
      } else {
        setQueue([...playlist])
        setQueueIndex(0)
      }
      return !prev
    })
  }

  return (
    <AudioContext.Provider value={{ isPlaying, currentTrack, togglePlay, skipNext, skipPrev, toggleShuffle, isShuffled }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}