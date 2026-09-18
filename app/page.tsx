'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAtmosphere } from '@/lib/atmosphere'

export default function Home() {
  const router = useRouter()
  const { background: bg, t } = useAtmosphere()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/journal')
      else setChecking(false)
    }
    checkSession()
  }, [router])

  if (checking) return <main className="min-h-screen" />

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
      padding: '48px 20px',
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.14) 100%)',
      }} />

      <div className="relative z-10 w-full" style={{ maxWidth: '430px', textAlign: 'center' }}>
        <p style={{
          color: bg.textColor, opacity: 0.58, fontSize: '9px',
          letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '8px',
        }}>
          Your personal journal
        </p>
        <h1 style={{
          color: bg.textColor, fontFamily: 'var(--font-lora)',
          fontSize: '52px', fontWeight: '300', lineHeight: '1',
          letterSpacing: '-0.04em', marginBottom: '12px',
        }}>
          MyLife
        </h1>
        <p style={{
          color: bg.textColor, opacity: 0.76,
          fontFamily: 'var(--font-lora)', fontSize: '14px',
          fontStyle: 'italic', marginBottom: '28px',
        }}>
          Remember not only what happened, but what the world felt like.
        </p>

        <section style={{
          background: t.cardBg, border: `1px solid ${t.cardBorder}`,
          borderRadius: '16px', padding: '26px 24px 22px',
          boxShadow: `0 16px 48px ${t.shadow}`, backdropFilter: 'blur(12px)',
        }}>
          <p style={{
            color: t.inputText, fontFamily: 'var(--font-lora)',
            fontSize: '17px', lineHeight: '1.7', marginBottom: '20px',
          }}>
            A quiet place for your entries, memories, weather, and passing days.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <Link href="/signup" style={{
              padding: '11px 14px', borderRadius: '9px',
              background: t.accent, color: '#ffffff', textDecoration: 'none',
              fontFamily: 'var(--font-lora)', fontSize: '13px',
            }}>
              Begin a journal
            </Link>
            <Link href="/login" style={{
              padding: '11px 14px', borderRadius: '9px',
              background: 'transparent', color: t.textMuted,
              border: `1px solid ${t.cardBorder}`, textDecoration: 'none',
              fontFamily: 'var(--font-lora)', fontSize: '13px',
            }}>
              Open my journal
            </Link>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: '14px',
            borderTop: `1px solid ${t.cardBorder}`, marginTop: '22px', paddingTop: '15px',
          }}>
            {['private', 'weather-aware', 'yours'].map((word) => (
              <span key={word} style={{
                color: t.textDim, fontSize: '9px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {word}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
