'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

export interface Track {
  id: number
  title: string
  file: string
}

export const playlist: Track[] = [
  { id: 1, title: 'I Gave It My All', file: '/audio/IGaveItMyAll.mp3' },
  { id: 2, title: 'For The Nights You Feel Behind', file: '/audio/ForTheNightsYouFeelBehind.mp3' },
  { id: 3, title: 'I Believe In You', file: '/audio/IBelieveInYou.mp3' },
  { id: 4, title: 'I Think I Found Peace', file: '/audio/IThinkIFoundPeace.mp3' },
  { id: 5, title: 'I Want To Be Excited For Tomorrow', file: '/audio/IWantToBeExcitedForTomorrow.mp3' },
  { id: 6, title: 'I Want To Smile Like The Strangers On The Street', file: '/audio/IWantToSmileLikeTheStrangersOnTheStreet.mp3' },
  { id: 7, title: 'Intention, Not Perfection', file: '/audio/IntentionNotPerfection.mp3' },
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
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(true)
  const [queue, setQueue] = useState<Track[]>(() => shuffleArray(playlist))
  const [queueIndex, setQueueIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = queue[queueIndex]

  // Auto-start on first user interaction anywhere on the page
  useEffect(() => {
    function handleFirstInteraction() {
      if (!hasInteracted) {
        setHasInteracted(true)
        setIsPlaying(true)
      }
    }
    window.addEventListener('click', handleFirstInteraction, { once: true })
    return () => window.removeEventListener('click', handleFirstInteraction)
  }, [hasInteracted])

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

  function skipNext() { goToNext() }
  function skipPrev() { goToPrev() }

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