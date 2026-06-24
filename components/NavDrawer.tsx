'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Journal', href: '/journal', icon: '✏️' },
  { label: 'Memories', href: '/memories', icon: '📖' },
  { label: 'Profile', href: '/profile', icon: '👤' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function NavDrawer() {
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const { t, mode, toggleMode } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    setOpen(false)
  }

  if (!authed) return null

  return (
    <>
      {/* Hamburger button — fixed top left, only shown when logged in */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 50,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          padding: '4px',
        }}
      >
        <span style={{ display: 'block', width: '20px', height: '1.5px', background: t.textMuted, transition: 'background 0.2s ease' }} />
        <span style={{ display: 'block', width: '20px', height: '1.5px', background: t.textMuted, transition: 'background 0.2s ease' }} />
        <span style={{ display: 'block', width: '20px', height: '1.5px', background: t.textMuted, transition: 'background 0.2s ease' }} />
      </button>

      {/* Backdrop — clicking outside closes drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 60,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '260px',
          background: t.cardBg,
          borderRight: `1px solid ${t.cardBorder}`,
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.5rem',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Logo */}
        <Link
          href="/journal"
          onClick={() => setOpen(false)}
          style={{
            fontFamily: 'var(--font-lora)',
            color: t.accent,
            fontSize: '22px',
            textDecoration: 'none',
            marginBottom: '2.5rem',
            display: 'block'
          }}
        >
          MyLife
        </Link>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontFamily: 'var(--font-lora)',
                  color: isActive ? t.accent : t.textMuted,
                  background: isActive ? t.entryBg : 'transparent',
                  border: isActive ? `1px solid ${t.cardBorder}` : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = t.accent
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = t.textMuted
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — theme toggle and sign out */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => { toggleMode(); setOpen(false) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'none',
              border: `1px solid ${t.cardBorder}`,
              color: t.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-lora)',
              transition: 'all 0.2s ease'
            }}
          >
            {mode === 'fire' ? '🔥 Firelight' : '🌧 Rain'}
          </button>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              color: t.textDim,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-lora)',
              transition: 'color 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#e05555'}
            onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
          >
            ← Sign out
          </button>
        </div>
      </div>
    </>
  )
}