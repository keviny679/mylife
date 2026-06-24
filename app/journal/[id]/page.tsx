'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [backHover, setBackHover] = useState(false)
  const [deleteHover, setDeleteHover] = useState(false)
  const router = useRouter()
  const { t } = useTheme()

  useEffect(() => {
    async function getEntry() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setEntry(data)
      }

      setLoading(false)
    }

    getEntry()
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('entries').delete().eq('id', entry.id)
    router.push('/journal')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)' }}>Loading...</p>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', marginBottom: '1rem' }}>Entry not found.</p>
        <Link href="/journal" style={{ color: t.accent, fontFamily: 'var(--font-lora)' }}>Back to journal</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">

        {/* Back link — subtle, top left */}
        <Link
          href="/journal"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: backHover ? t.accent : t.textDim,
            textDecoration: 'none',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            transition: 'color 0.2s ease'
          }}
        >
          ← journal
        </Link>

        {/* Date and mood — small, quiet */}
        <p style={{
          fontSize: '12px',
          color: t.textDim,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {entry.mood && ` · ${entry.mood}`}
        </p>

        {/* Title — large, warm, only if exists */}
        {entry.title && (
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.accent,
            fontSize: '36px',
            fontWeight: '500',
            marginBottom: '2.5rem',
            lineHeight: '1.3'
          }}>
            {entry.title}
          </h1>
        )}

        {/* Divider */}
        <div style={{ width: '40px', height: '1px', background: t.cardBorder, marginBottom: '2.5rem' }} />

        {/* Body — the focus of the whole page */}
        <div style={{
          fontFamily: 'var(--font-lora)',
          color: t.bodyText,
          fontSize: '19px',
          lineHeight: '2.1',
          whiteSpace: 'pre-wrap'
        }}>
          {entry.body}
        </div>

        {/* Delete — at the very bottom, quiet until hovered */}
        <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: `1px solid ${t.entryBorder}` }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            style={{
              fontSize: '12px',
              color: deleteHover ? '#e05555' : t.textDim,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.2s ease',
              padding: '0'
            }}
          >
            {deleting ? 'deleting...' : '× delete this entry'}
          </button>
        </div>

      </div>
    </main>
  )
}