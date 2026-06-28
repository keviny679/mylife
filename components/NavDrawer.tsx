'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme, modeOptions, Mode } from '@/lib/theme-context'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Community', href: '/community' },
  { label: 'Journal', href: '/journal' },
  { label: 'Memories', href: '/memories' },
  { label: 'Profile', href: '/profile' },
]

export default function NavDrawer() {
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const { t, mode, setMode } = useTheme()
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

  const authPages = ['/login', '/signup']
  if (!authed || authPages.includes(pathname)) return null

  return (
    <>
      {/* Hamburger — three lines, top left */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: '20px', left: '20px',
          zIndex: 50, background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex',
          flexDirection: 'column', gap: '5px', padding: '4px',
        }}
      >
        <span style={{ display: 'block', width: '20px', height: '1px', background: t.textMuted }} />
        <span style={{ display: 'block', width: '14px', height: '1px', background: t.textMuted }} />
        <span style={{ display: 'block', width: '20px', height: '1px', background: t.textMuted }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 60, backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: '240px',
        background: t.cardBg,
        borderRight: `1px solid ${t.cardBorder}`,
        zIndex: 70, display: 'flex', flexDirection: 'column',
        padding: '2rem 1.5rem',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        boxShadow: open ? `6px 0 32px ${t.shadow}` : 'none',
        overflowY: 'auto',
      }}>

        {/* Logo + subtitle */}
        <Link
          href="/journal"
          onClick={() => setOpen(false)}
          style={{ textDecoration: 'none', marginBottom: '2.5rem', display: 'block' }}
        >
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '2px',
            letterSpacing: '-0.01em',
          }}>
            MyLife
          </p>
          <p style={{
            fontSize: '10px',
            color: t.textDim,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            a private record
          </p>
        </Link>

        {/* Nav items — no icons, just text */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '2.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-lora)',
                  color: isActive ? t.accent : t.textMuted,
                  background: isActive ? `${t.accent}12` : 'transparent',
                  borderLeft: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  paddingLeft: isActive ? '12px' : '10px',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = t.inputText }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = t.textMuted }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/*
          ATMOSPHERE PICKER
          Dot indicators instead of emoji — cleaner, more analog.
          Each dot is the theme's accent color. Active has a ring.
          Label sits to the right.
        */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontSize: '10px', color: t.textDim,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '12px', paddingLeft: '2px'
          }}>
            Atmosphere
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {modeOptions.map((option) => {
              const isActive = mode === option.mode
              const dotColors: Record<string, string> = {
                nostalgic: '#36BBD9',
                rain: '#86A6B4',
                firelight: '#D68A4F',
                dawn: '#D6A08C',
                dusk: '#B083A0',
                midnight: '#7C89B0',
              }
              return (
                <button
                  key={option.mode}
                  onClick={() => { setMode(option.mode as Mode); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px', borderRadius: '4px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Dot indicator */}
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: dotColors[option.mode],
                    flexShrink: 0,
                    outline: isActive ? `2px solid ${dotColors[option.mode]}` : '2px solid transparent',
                    outlineOffset: '2px',
                    opacity: isActive ? 1 : 0.45,
                    transition: 'all 0.15s ease',
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-lora)',
                    color: isActive ? t.inputText : t.textFaint,
                    transition: 'color 0.15s ease',
                  }}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sign out */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: '1px', background: t.cardBorder, marginBottom: '1rem' }} />
          <button
            onClick={handleSignOut}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 10px', background: 'none', border: 'none',
              color: t.textDim, fontSize: '13px', cursor: 'pointer',
              fontFamily: 'var(--font-lora)', transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#c05050'}
            onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
          >
            sign out
          </button>
        </div>
      </div>
    </>
  )
}