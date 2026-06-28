'use client'

import { useState } from 'react'
import { useAudio } from '@/lib/audio-context'
import { useTheme } from '@/lib/theme-context'

export default function AudioPlayer() {
  const { isPlaying, currentTrack, togglePlay, skipNext, skipPrev, toggleShuffle, isShuffled } = useAudio()
  const { t } = useTheme()
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px',
    }}>

      {/* Expanded player — folded paper card */}
      {expanded && (
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '6px',
          padding: '14px 16px',
          width: '240px',
          boxShadow: `0 4px 24px ${t.shadow}`,
        }}>

          {/* Track title */}
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '13px',
            fontStyle: 'italic',
            marginBottom: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {currentTrack.title}
          </p>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>

            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px',
                color: isShuffled ? t.accent : t.textDim,
                padding: '4px',
                transition: 'color 0.15s ease',
                fontFamily: 'var(--font-lora)',
                letterSpacing: '0.02em',
              }}
            >
              ⇄
            </button>

            {/* Skip back */}
            <button
              onClick={skipPrev}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: t.textMuted, padding: '4px',
                fontSize: '14px',
                transition: 'color 0.15s ease',
              }}
            >
              ‹‹
            </button>

            {/* Play/pause */}
            <button
              onClick={togglePlay}
              style={{
                background: t.accent,
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                cursor: 'pointer',
                fontSize: '12px',
                color: t.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Skip forward */}
            <button
              onClick={skipNext}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: t.textMuted, padding: '4px',
                fontSize: '14px',
                transition: 'color 0.15s ease',
              }}
            >
              ››
            </button>

            {/* Close */}
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px',
                color: t.textDim, padding: '4px',
                transition: 'color 0.15s ease',
                fontFamily: 'var(--font-lora)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.textMuted}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Collapsed pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '4px',
          padding: '7px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: `0 2px 12px ${t.shadow}`,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {/* Playing indicator dot */}
        <div style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: isPlaying ? t.accent : t.textDim,
          flexShrink: 0,
          transition: 'background 0.2s ease',
        }} />

        <span style={{
          fontFamily: 'var(--font-lora)',
          color: isPlaying ? t.inputText : t.textMuted,
          fontSize: '12px',
          fontStyle: 'italic',
          maxWidth: '130px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.15s ease',
        }}>
          {isPlaying ? currentTrack.title : 'ambient sounds'}
        </span>
      </button>

    </div>
  )
}