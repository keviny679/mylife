'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-500" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />

      <div className="relative z-10 w-full max-w-md px-6">
        <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>MyLife</h1>
        <p style={{ color: t.textFaint, fontSize: '14px', textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>Welcome back</p>

        <div className="rounded-xl p-8" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', background: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: '8px', color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '15px', padding: '12px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', background: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: '8px', color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '15px', padding: '12px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: t.accentStrong, color: t.bg, border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '15px', fontFamily: 'var(--font-lora)' }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {message && (
            <p style={{ color: t.accent, fontSize: '13px', textAlign: 'center', marginTop: '1rem' }}>{message}</p>
          )}
        </div>

        <p style={{ color: t.textFaint, fontSize: '13px', textAlign: 'center', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: t.textMuted }}>Sign up</a>
        </p>
      </div>
    </main>
  )
}