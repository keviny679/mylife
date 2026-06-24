'use client'

import { useState } from 'react'
import { useAudio } from '@/lib/audio-context'
import { useTheme } from '@/lib/theme-context'

export default function AudioPlayer() {
  const { isPlaying, currentTrack, togglePlay, skipNext, skipPrev, toggleShuffle, isShuffled } = useAudio()
  const { t } = useTheme()
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Expanded player */}
      {expanded && (
        <div
          style={{
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: '16px',
            padding: '16px 20px',
            width: '260px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Track title */}
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '15px',
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            {currentTrack.title}
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              title="Shuffle"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: isShuffled ? t.accent : t.textDim,
                padding: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              ⇄
            </button>

            {/* Skip back */}
            <button
              onClick={skipPrev}
              title="Previous"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: t.textMuted,
                padding: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              ⏮
            </button>

            {/* Play/pause — main button */}
            <button
              onClick={togglePlay}
              style={{
                background: t.accentStrong,
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '16px',
                color: t.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s ease'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Skip forward */}
            <button
              onClick={skipNext}
              title="Next"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: t.textMuted,
                padding: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              ⏭
            </button>

            {/* Close expanded */}
            <button
              onClick={() => setExpanded(false)}
              title="Collapse"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: t.textDim,
                padding: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              ✕
            </button>

          </div>
        </div>
      )}

      {/* Collapsed pill — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '14px' }}>🌧</span>
        <span style={{
          fontFamily: 'var(--font-lora)',
          color: isPlaying ? t.accent : t.textMuted,
          fontSize: '13px',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {isPlaying ? currentTrack.title : 'ambient sounds'}
        </span>
        <span style={{ fontSize: '11px', color: t.textDim }}>
          {isPlaying ? '▶' : '○'}
        </span>
      </button>

    </div>
  )
}