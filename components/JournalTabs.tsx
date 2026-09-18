'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAtmosphere } from '@/lib/atmosphere'

const tabs = [
  { label: 'Entries', href: '/journal' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Memories', href: '/memories' },
]

export default function JournalTabs() {
  const pathname = usePathname()
  const { background: bg } = useAtmosphere()

  return (
    <nav aria-label="Journal views" style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      border: `1px solid ${bg.cardBorder}`,
      borderRadius: '8px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(8px)', marginTop: '40px', marginBottom: '2rem',
    }}>
      {tabs.map((tab, index) => {
        const active = pathname === tab.href || (tab.href === '/journal' && pathname.startsWith('/journal/'))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: '9px 8px', textAlign: 'center', textDecoration: 'none',
              fontFamily: 'var(--font-lora)', fontSize: '12px',
              letterSpacing: '0.03em',
              color: active ? bg.secondaryText : bg.textColor,
              background: active ? bg.cardBg : 'transparent',
              borderLeft: index > 0 ? `1px solid ${bg.cardBorder}` : 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
