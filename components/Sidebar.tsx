'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Journal', href: '/journal', icon: '✏️' },
  { label: 'Memories', href: '/memories', icon: '📖' },
  { label: 'Profile', href: '/profile', icon: '👤' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const { t, mode, toggleMode } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [signOutHover, setSignOutHover] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: t.cardBg,
        borderRight: `1px solid ${t.cardBorder}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <Link
        href="/journal"
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
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

      {/* Bottom section — theme toggle and sign out */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={toggleMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'none',
            border: `1px solid ${t.cardBorder}`,
            color: t.textMuted,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-lora)'
          }}
        >
          {mode === 'fire' ? '🔥 Firelight' : '🌧 Rain'}
        </button>

        <button
          onClick={handleSignOut}
          onMouseEnter={() => setSignOutHover(true)}
          onMouseLeave={() => setSignOutHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'none',
            border: 'none',
            color: signOutHover ? '#e05555' : t.textDim,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            fontFamily: 'var(--font-lora)',
            textAlign: 'left'
          }}
        >
          ← Sign out
        </button>
      </div>
    </aside>
  )
}