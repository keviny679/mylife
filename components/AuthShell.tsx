'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { useAtmosphere } from '@/lib/atmosphere'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  const { background: bg, t } = useAtmosphere()

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
      padding: '48px 20px',
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.14) 100%)',
      }} />

      <div className="relative z-10 w-full" style={{ maxWidth: '390px' }}>
        <Link href="/" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '26px' }}>
          <p style={{
            color: bg.textColor, opacity: 0.58, fontSize: '9px',
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '5px',
          }}>
            {eyebrow}
          </p>
          <p style={{
            color: bg.textColor, fontFamily: 'var(--font-lora)',
            fontSize: '30px', fontWeight: '400', letterSpacing: '-0.02em',
          }}>
            MyLife
          </p>
        </Link>

        <section style={{
          background: t.cardBg, border: `1px solid ${t.cardBorder}`,
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: `0 16px 48px ${t.shadow}`,
          backdropFilter: 'blur(12px)',
        }}>
          <header style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${t.cardBorder}` }}>
            <h1 style={{
              color: t.inputText, fontFamily: 'var(--font-lora)',
              fontSize: '22px', fontWeight: '500', marginBottom: '5px',
            }}>
              {title}
            </h1>
            <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', fontSize: '12px', fontStyle: 'italic' }}>
              {subtitle}
            </p>
          </header>

          <div style={{ padding: '22px 24px 24px' }}>{children}</div>
        </section>

        <div style={{
          color: bg.textColor, opacity: 0.76, textAlign: 'center',
          fontFamily: 'var(--font-lora)', fontSize: '12px', marginTop: '18px',
        }}>
          {footer}
        </div>
      </div>
    </main>
  )
}

export function AuthField({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { t } = useAtmosphere()
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'block', color: t.textDim, fontSize: '9px',
        letterSpacing: '0.11em', textTransform: 'uppercase', margin: '0 0 6px 2px',
      }}>
        {label}
      </span>
      <input
        {...props}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.38)',
          border: `1px solid ${t.entryBorder}`, borderRadius: '8px',
          color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '14px',
          padding: '11px 12px', outline: 'none',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = t.accent
          event.currentTarget.style.background = 'rgba(255,255,255,0.62)'
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = t.entryBorder
          event.currentTarget.style.background = 'rgba(255,255,255,0.38)'
        }}
      />
    </label>
  )
}

export function AuthSubmit({ loading, children }: { loading: boolean; children: ReactNode }) {
  const { t } = useAtmosphere()
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '11px 14px', border: 'none', borderRadius: '9px',
      background: t.accent, color: '#ffffff', cursor: loading ? 'wait' : 'pointer',
      fontFamily: 'var(--font-lora)', fontSize: '13px', letterSpacing: '0.03em',
      opacity: loading ? 0.62 : 1, transition: 'opacity 0.15s ease',
    }}>
      {children}
    </button>
  )
}
