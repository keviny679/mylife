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
          .from('profiles').select('is_admin').eq('id', user.id).single()
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
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header — left aligned, same voice as Memories */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}>
            This Week
          </h1>
          <p style={{
            color: t.textFaint,
            fontSize: '13px',
            fontFamily: 'var(--font-lora)',
            fontStyle: 'italic',
          }}>
            entries people chose to share. anonymous, intentional, fleeting.
          </p>
        </div>

        {/* Empty state */}
        {entries.length === 0 ? (
          <div style={{ marginTop: '6rem' }}>
            <p style={{
              fontFamily: 'var(--font-lora)',
              color: t.textFaint,
              fontSize: '17px',
              fontStyle: 'italic',
              marginBottom: '6px',
            }}>
              Nothing shared this week yet.
            </p>
            <p style={{ color: t.textDim, fontSize: '13px', fontFamily: 'var(--font-lora)' }}>
              Be the first to share an entry.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {entries.map((entry, index) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '20px 20px',
                  background: index % 2 === 0 ? t.entryBg : t.cardBg,
                  borderTop: index === 0 ? `1px solid ${t.cardBorder}` : 'none',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  borderLeft: `1px solid ${t.cardBorder}`,
                  borderRight: `1px solid ${t.cardBorder}`,
                  borderRadius: index === 0 ? '4px 4px 0 0' : index === entries.length - 1 ? '0 0 4px 4px' : '0',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.cardBg}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? t.entryBg : t.cardBg}
              >
                {/* Admin remove */}
                {isAdmin && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleRemove(entry.id) }}
                    style={{
                      position: 'absolute', top: '14px', right: '16px',
                      fontSize: '10px', color: t.textDim,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'color 0.15s ease',
                      fontFamily: 'var(--font-lora)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#c05050'}
                    onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
                  >
                    remove
                  </span>
                )}

                {/* Date and mood */}
                <p style={{
                  fontSize: '11px',
                  color: t.textFaint,
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-lora)',
                  marginBottom: '10px',
                }}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                  })}
                  {entry.mood && ` · ${entry.mood.split(' ').slice(1).join(' ')}`}
                </p>

                {/* Title */}
                {entry.title && (
                  <p style={{
                    fontFamily: 'var(--font-lora)',
                    color: t.inputText,
                    fontSize: '17px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    lineHeight: '1.3',
                  }}>
                    {entry.title}
                  </p>
                )}

                {/* Body preview */}
                <p style={{
                  fontFamily: 'var(--font-lora)',
                  color: t.bodyText,
                  fontSize: '14px',
                  lineHeight: '1.8',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical' as const,
                  marginBottom: '12px',
                }}>
                  {entry.body}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{
                    fontSize: '11px',
                    color: t.textDim,
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-lora)',
                  }}>
                    — a writer
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: t.textDim,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-lora)',
                  }}>
                    read →
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p style={{
          fontFamily: 'var(--font-lora)',
          color: t.textDim,
          fontSize: '12px',
          fontStyle: 'italic',
          marginTop: '3rem',
          letterSpacing: '0.02em',
        }}>
          Entries disappear after 7 days. Write for yourself. Share when it feels right.
        </p>
      </div>

      {/* Full page read — same page turn as Memories */}
      {selectedEntry && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: t.bg, overflowY: 'auto',
          animation: 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
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
                color: t.textDim, fontSize: '11px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '4rem', display: 'flex', alignItems: 'center',
                gap: '6px', padding: 0, fontFamily: 'var(--font-lora)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
            >
              ← this week
            </button>

            <p style={{
              fontSize: '11px', color: t.textFaint,
              fontStyle: 'italic', fontFamily: 'var(--font-lora)',
              marginBottom: '1.5rem',
              animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              {new Date(selectedEntry.created_at).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
              {selectedEntry.mood && ` · ${selectedEntry.mood.split(' ').slice(1).join(' ')}`}
            </p>

            {selectedEntry.title && (
              <h2 style={{
                fontFamily: 'var(--font-lora)',
                color: t.inputText,
                fontSize: '30px',
                fontWeight: '600',
                marginBottom: '2rem',
                lineHeight: '1.25',
                letterSpacing: '-0.01em',
                animation: 'fadeUp 0.5s ease 0.15s both',
              }}>
                {selectedEntry.title}
              </h2>
            )}

            <div style={{
              width: '32px', height: '1px',
              background: t.cardBorder, marginBottom: '2rem',
              animation: 'fadeUp 0.5s ease 0.2s both',
            }} />

            <p style={{
              fontFamily: 'var(--font-lora)',
              color: t.bodyText,
              fontSize: '18px',
              lineHeight: '2.1',
              whiteSpace: 'pre-wrap',
              animation: 'fadeUp 0.6s ease 0.25s both',
            }}>
              {selectedEntry.body}
            </p>

            <div style={{
              marginTop: '4rem', paddingTop: '1.5rem',
              borderTop: `1px solid ${t.entryBorder}`,
              animation: 'fadeUp 0.5s ease 0.35s both',
            }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: t.textDim,
                fontSize: '13px',
                fontStyle: 'italic',
              }}>
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