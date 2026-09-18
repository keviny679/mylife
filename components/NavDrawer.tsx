'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtmosphere } from '@/lib/atmosphere'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Journal', href: '/journal' },
  { label: 'Community', href: '/community' },
  { label: 'Profile', href: '/profile' },
]

const journalPaths = ['/journal', '/calendar', '/memories']

function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function NavDrawer() {
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const { background: bg, t } = useAtmosphere()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setAuthed(!!session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    } else if (wasOpen.current) {
      triggerRef.current?.focus()
    }
    wasOpen.current = open

    if (!open) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
  }

  if (!authed || ['/login', '/signup'].includes(pathname)) return null

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close menu' : 'Open settings and navigation'}
        aria-expanded={open}
        style={{
          position: 'fixed',
          top: 'calc(10px + env(safe-area-inset-top))',
          right: 'calc(10px + env(safe-area-inset-right))',
          zIndex: 110, width: '44px', height: '44px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? t.inputText : bg.textColor, opacity: open ? 1 : 0.68,
          background: open ? t.cardBg : 'transparent',
          border: open ? `1px solid ${t.cardBorder}` : '1px solid transparent',
          backdropFilter: 'blur(12px)', cursor: 'pointer',
          boxShadow: open ? `0 6px 24px ${t.shadow}` : 'none',
          transition: 'background 0.18s ease, color 0.18s ease, opacity 0.18s ease',
        }}
      >
        {open ? <CloseIcon /> : <GearIcon />}
      </button>

      {open && (
        <button aria-label="Close menu" onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 99, border: 'none',
          background: 'rgba(15,25,35,0.14)', backdropFilter: 'blur(2px)', cursor: 'default',
        }} />
      )}

      <div ref={menuRef} role="dialog" aria-modal="true" aria-label="Settings and navigation" aria-hidden={!open} inert={!open} style={{
        position: 'fixed',
        top: 'calc(60px + env(safe-area-inset-top))',
        right: 'calc(12px + env(safe-area-inset-right))', zIndex: 100,
        width: 'min(248px, calc(100vw - 24px))', padding: '10px', background: t.cardBg,
        border: `1px solid ${t.cardBorder}`, borderRadius: '14px',
        backdropFilter: 'blur(18px)', boxShadow: `0 18px 48px ${t.shadow}`,
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        transformOrigin: 'top right', pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
      }}>
        <div style={{ padding: '8px 10px 10px' }}>
          <p style={{ color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>MyLife</p>
          <p style={{ color: t.textDim, fontSize: '10px', letterSpacing: '0.08em' }}>YOUR PERSONAL JOURNAL</p>
        </div>

        <nav aria-label="Main navigation" style={{ borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}`, padding: '6px 0', marginBottom: '8px' }}>
          {navItems.map((item) => {
            const active = item.href === '/journal'
              ? journalPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
              : pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px', borderRadius: '8px', textDecoration: 'none',
                color: active ? t.inputText : t.textMuted,
                background: active ? `${t.accent}14` : 'transparent',
                fontFamily: 'var(--font-lora)', fontSize: '13px',
              }}>
                {item.label}
                {active && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.accent }} />}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '5px 10px 10px' }}>
          <p style={{ color: t.textDim, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Atmosphere</p>
          <p style={{ color: t.textMuted, fontFamily: 'var(--font-lora)', fontSize: '11px', fontStyle: 'italic' }}>follows your local time and weather</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', paddingTop: '5px', borderTop: `1px solid ${t.cardBorder}` }}>
          <a href="https://ko-fi.com/H1D4228PA0" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '8px 10px', textDecoration: 'none', color: t.textDim, fontFamily: 'var(--font-lora)', fontSize: '11px' }}>Support</a>
          <button onClick={handleSignOut} style={{ padding: '8px 10px', border: 'none', background: 'transparent', color: t.textDim, fontFamily: 'var(--font-lora)', fontSize: '11px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>
    </>
  )
}
