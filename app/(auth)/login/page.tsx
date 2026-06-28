'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { t } = useTheme()

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/journal')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 w-full px-6" style={{ maxWidth: '380px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}>
            MyLife
          </h1>
          <p style={{
            color: t.textFaint,
            fontSize: '13px',
            fontFamily: 'var(--font-lora)',
            fontStyle: 'italic',
          }}>
            welcome back
          </p>
        </div>

        {/* Form — folded paper card */}
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '6px',
          padding: '2rem',
          boxShadow: `0 2px 16px ${t.shadow}`,
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: t.entryBg,
                border: `1px solid ${t.entryBorder}`,
                borderRadius: '3px',
                color: t.inputText,
                fontFamily: 'var(--font-lora)',
                fontSize: '14px',
                padding: '10px 12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = t.entryBorder}
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              style={{
                width: '100%',
                background: t.entryBg,
                border: `1px solid ${t.entryBorder}`,
                borderRadius: '3px',
                color: t.inputText,
                fontFamily: 'var(--font-lora)',
                fontSize: '14px',
                padding: '10px 12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = t.entryBorder}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '3px',
              background: t.accent,
              color: t.bg,
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'var(--font-lora)',
              letterSpacing: '0.04em',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            {loading ? 'logging in...' : 'log in'}
          </button>

          {message && (
            <p style={{
              color: '#c05050',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '1rem',
              fontFamily: 'var(--font-lora)',
              fontStyle: 'italic',
            }}>
              {message}
            </p>
          )}
        </div>

        <p style={{
          color: t.textDim,
          fontSize: '12px',
          textAlign: 'center',
          fontFamily: 'var(--font-lora)',
        }}>
          no account?{' '}
          <Link href="/signup" style={{
            color: t.textMuted,
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
            onMouseLeave={(e) => e.currentTarget.style.color = t.textMuted}
          >
            start writing
          </Link>
        </p>
      </div>
    </main>
  )
}