'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtmosphere } from '@/lib/atmosphere'
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
  const { background: bg, t } = useAtmosphere()
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
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: '20px', left: '20px',
          zIndex: 50, background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex',
          flexDirection: 'column', gap: '5px', padding: '4px',
        }}
      >
        <span style={{ display: 'block', width: '20px', height: '1px', background: bg.textColor }} />
        <span style={{ display: 'block', width: '14px', height: '1px', background: bg.textColor }} />
        <span style={{ display: 'block', width: '20px', height: '1px', background: bg.textColor }} />
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
            your personal journal
          </p>
        </Link>

        {/* Nav items */}
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

        <div style={{
          marginBottom: '2rem', padding: '12px 10px',
          borderTop: `1px solid ${t.cardBorder}`,
          borderBottom: `1px solid ${t.cardBorder}`,
        }}>
          <p style={{
            fontSize: '10px', color: t.textDim,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Current atmosphere
          </p>
          <p style={{
            fontSize: '13px', color: t.inputText,
            fontFamily: 'var(--font-lora)', fontStyle: 'italic',
          }}>
            shaped by your time and weather
          </p>
        </div>

        {/* Bottom — Ko-fi + sign out */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: '1px', background: t.cardBorder, marginBottom: '1rem' }} />

          {/* Ko-fi */}
          <a
            href="https://ko-fi.com/H1D4228PA0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '12px',
              fontFamily: 'var(--font-lora)',
              color: t.textDim,
              transition: 'color 0.15s ease',
              marginBottom: '2px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
            onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
          >
            <span style={{ fontSize: '13px' }}>☕</span>
            support me!
          </a>

          {/* Sign out */}
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
