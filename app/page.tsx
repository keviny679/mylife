'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function Home() {
  const router = useRouter()
  const { t } = useTheme()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/journal')
      } else {
        setChecking(false)
      }
    }
    checkSession()
  }, [])

  if (checking) {
    return <main className="min-h-screen" style={{ background: t.bg }} />
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6" style={{ maxWidth: '480px' }}>

        {/* Logo */}
        <h1 style={{
          fontFamily: 'var(--font-lora)',
          color: t.inputText,
          fontSize: '48px',
          fontWeight: '600',
          letterSpacing: '-0.02em',
          marginBottom: '12px',
          lineHeight: '1',
        }}>
          MyLife
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-lora)',
          color: t.textFaint,
          fontSize: '16px',
          fontStyle: 'italic',
          marginBottom: '6px',
          lineHeight: '1.5',
        }}>
          A private record of your days.
        </p>
        <p style={{
          color: t.textDim,
          fontSize: '13px',
          marginBottom: '52px',
          letterSpacing: '0.02em',
        }}>
          Write at the end of the day. Just for you.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '220px', marginBottom: '64px' }}>
          <Link
            href="/signup"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              background: t.accent,
              color: t.bg,
              fontSize: '13px',
              fontFamily: 'var(--font-lora)',
              textAlign: 'center',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            start writing
          </Link>
          <Link
            href="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              background: 'transparent',
              color: t.textMuted,
              fontSize: '13px',
              fontFamily: 'var(--font-lora)',
              textAlign: 'center',
              textDecoration: 'none',
              border: `1px solid ${t.cardBorder}`,
              letterSpacing: '0.04em',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = t.inputText
              e.currentTarget.style.borderColor = t.textDim
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = t.textMuted
              e.currentTarget.style.borderColor = t.cardBorder
            }}
          >
            log in
          </Link>
        </div>

        {/* Feature strip — quiet, no emojis */}
        <div style={{
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          borderTop: `1px solid ${t.cardBorder}`,
          paddingTop: '28px',
        }}>
          {[
            'ambient sounds',
            'six atmospheres',
            'mood tracking',
            'streak counter',
            'community feed',
          ].map((feature) => (
            <span
              key={feature}
              style={{
                fontSize: '11px',
                color: t.textDim,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-lora)',
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}