'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function Home() {
  const router = useRouter()
  const { t, mode, toggleMode } = useTheme()
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
    return (
      <main className="min-h-screen" style={{ background: t.bg }} />
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-500" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
<div className="absolute pointer-events-none transition-colors duration-500" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '52px', marginBottom: '16px' }}>MyLife</h1>
        <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '18px', fontStyle: 'italic', marginBottom: '8px' }}>Your private space to reflect.</p>
        <p style={{ color: t.textFaint, fontSize: '14px', marginBottom: '48px' }}>Write at the end of the day. Just for you.</p>

        <div className="flex flex-col gap-3 mb-16" style={{ width: '240px' }}>
          <Link href="/signup" style={{ display: 'block', width: '100%', padding: '13px', borderRadius: '8px', background: t.accentStrong, color: t.bg, fontWeight: '500', fontSize: '15px', fontFamily: 'var(--font-lora)', textAlign: 'center', textDecoration: 'none' }}>
            Start writing
          </Link>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: '13px', borderRadius: '8px', background: 'transparent', color: t.textMuted, fontSize: '15px', fontFamily: 'var(--font-lora)', textAlign: 'center', textDecoration: 'none', border: `1px solid ${t.cardBorder}` }}>
            Log in
          </Link>
        </div>

        <div className="flex gap-8 flex-wrap justify-center">
          {[
            { icon: '🌧', label: 'Rain sounds' },
            { icon: '🔥', label: 'Firelight mode' },
            { icon: '😌', label: 'Mood tracking' },
            { icon: '🔥', label: 'Streak counter' },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <span style={{ fontSize: '22px' }}>{feature.icon}</span>
              <span style={{ fontSize: '12px', color: t.textDim, letterSpacing: '0.05em' }}>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}