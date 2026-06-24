'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function Community() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const { t } = useTheme()

  useEffect(() => {
    async function load() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

      const { data } = await supabase
        .from('entries')
        .select('id, title, body, mood, created_at, shared_at')
        .eq('is_public', true)
        .gte('shared_at', sevenDaysAgo)
        .order('shared_at', { ascending: false })

      setEntries(data || [])

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.is_admin || false)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleRemove(entryId: string) {
    if (!confirm('Remove this entry from the public feed?')) return
    await supabase
      .from('entries')
      .update({ is_public: false, shared_at: null })
      .eq('id', entryId)
    setEntries(entries.filter(e => e.id !== entryId))
    if (selectedEntry?.id === entryId) setSelectedEntry(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '28px', marginBottom: '8px' }}>
            This Week
          </h1>
          <p style={{ color: t.textFaint, fontSize: '13px', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
            Entries people chose to share. Anonymous, intentional, fleeting.
          </p>
        </div>

        {/* Empty state */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '6rem' }}>
            <p style={{ fontFamily: 'var(--font-lora)', color: t.textFaint, fontSize: '18px', fontStyle: 'italic', marginBottom: '8px' }}>
              Nothing shared this week yet.
            </p>
            <p style={{ color: t.textDim, fontSize: '13px' }}>
              Be the first to share an entry.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '28px 32px',
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}
              >
                {/* Admin remove */}
                {isAdmin && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleRemove(entry.id) }}
                    style={{
                      position: 'absolute', top: '16px', right: '16px',
                      fontSize: '11px', color: t.textDim,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e05555'}
                    onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
                  >
                    remove
                  </span>
                )}

                {/* Date and mood */}
                <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {entry.mood && ` · ${entry.mood.split(' ')[0]}`}
                </p>

                {/* Title */}
                {entry.title && (
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '20px', fontWeight: '500', marginBottom: '12px', lineHeight: '1.3' }}>
                    {entry.title}
                  </p>
                )}

                {/* Body preview — 3 lines */}
                <p style={{
                  fontFamily: 'var(--font-lora)', color: t.bodyText,
                  fontSize: '16px', lineHeight: '1.9',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const
                }}>
                  {entry.body}
                </p>

                {/* Attribution + read hint */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.06em', fontStyle: 'italic', fontFamily: 'var(--font-lora)' }}>
                    — a writer
                  </p>
                  <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    read →
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ fontFamily: 'var(--font-lora)', color: t.textDim, fontSize: '13px', fontStyle: 'italic' }}>
            Entries disappear after 7 days. Write for yourself. Share when it feels right.
          </p>
        </div>
      </div>

      {/* Full page entry read — same page-turn feel as memories */}
      {selectedEntry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: t.bg,
            overflowY: 'auto',
            animation: 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            position: 'fixed', bottom: '-100px', left: '-100px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)`,
            pointerEvents: 'none', animation: 'glowPulse 1s ease forwards', opacity: 0,
          }} />
          <div style={{
            position: 'fixed', top: '-80px', right: '-80px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)`,
            pointerEvents: 'none', animation: 'glowPulse 1.3s ease forwards', opacity: 0,
          }} />

          <div style={{ maxWidth: '560px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: t.textDim, fontSize: '12px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '4rem', display: 'flex', alignItems: 'center',
                gap: '6px', padding: 0, fontFamily: 'var(--font-lora)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
            >
              ← this week
            </button>

            <p style={{
              fontSize: '11px', color: t.textDim,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: '1rem', animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              {new Date(selectedEntry.created_at).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
              {selectedEntry.mood && ` · ${selectedEntry.mood}`}
            </p>

            {selectedEntry.title && (
              <h2 style={{
                fontFamily: 'var(--font-lora)', color: t.accent,
                fontSize: '32px', fontWeight: '500',
                marginBottom: '2rem', lineHeight: '1.3',
                animation: 'fadeUp 0.5s ease 0.15s both',
              }}>
                {selectedEntry.title}
              </h2>
            )}

            <div style={{
              width: '48px', height: '1px',
              background: t.cardBorder, marginBottom: '2.5rem',
              animation: 'fadeUp 0.5s ease 0.2s both',
            }} />

            <p style={{
              fontFamily: 'var(--font-lora)', color: t.inputText,
              fontSize: '19px', lineHeight: '2.2', whiteSpace: 'pre-wrap',
              animation: 'fadeUp 0.6s ease 0.25s both',
            }}>
              {selectedEntry.body}
            </p>

            <div style={{
              marginTop: '4rem', paddingTop: '2rem',
              borderTop: `1px solid ${t.entryBorder}`,
              animation: 'fadeUp 0.5s ease 0.35s both',
            }}>
              <p style={{ fontFamily: 'var(--font-lora)', color: t.textDim, fontSize: '13px', fontStyle: 'italic' }}>
                — a writer
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateX(32px) }
          to { opacity: 1; transform: translateX(0) }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes glowPulse {
          from { opacity: 0 }
          to { opacity: 1 }
        }
      `}</style>
    </main>
  )
}