'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

const moods = ['😊 good', '😐 neutral', '😔 sad']

export default function Memories() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [randomMemory, setRandomMemory] = useState<any>(null)
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const router = useRouter()
  const { t } = useTheme()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setEntries(data)
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        setOpenMonths(new Set([currentMonth]))
        const today = new Date().toDateString()
        const older = data.filter((e: any) => new Date(e.created_at).toDateString() !== today)
        if (older.length > 0) {
          setRandomMemory(older[Math.floor(Math.random() * older.length)])
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  function toggleMonth(month: string) {
    setOpenMonths((prev) => {
      const next = new Set(prev)
      if (next.has(month)) { next.delete(month) } else { next.add(month) }
      return next
    })
  }

  const filtered = activeMood
    ? entries.filter((e: any) => e.mood === activeMood)
    : entries

  const moodCounts = entries.reduce((acc: Record<string, number>, e: any) => {
    if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {})

  const favoriteMood = Object.entries(moodCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || null

  const grouped = filtered.reduce((groups: Record<string, any[]>, entry: any) => {
    const key = new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
    return groups
  }, {})

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
<div className="absolute pointer-events-none transition-colors duration-500" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '28px', marginBottom: '8px' }}>
            Memories
          </h1>
          <p style={{ color: t.textFaint, fontSize: '13px', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
            Everything you've written, waiting to be rediscovered.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex',
          marginBottom: '2rem',
          background: t.cardBorder,
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${t.cardBorder}`,
          gap: '1px'
        }}>
          {[
            { label: 'Entries', value: String(entries.length) },
            { label: 'Moods logged', value: String(Object.values(moodCounts).reduce((a: number, b: number) => a + b, 0)) },
            { label: 'Favorite mood', value: favoriteMood ? favoriteMood.split(' ').slice(1).join(' ') : '—' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, padding: '16px', background: t.cardBg, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '20px', fontWeight: '500', marginBottom: '4px' }}>
                {stat.value}
              </p>
              <p style={{ color: t.textDim, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Random memory */}
        {randomMemory && (
          <button
            onClick={() => setSelectedEntry(randomMemory)}
            style={{
              width: '100%',
              textAlign: 'left',
              marginBottom: '2rem',
              padding: '20px 24px',
              background: t.cardBg,
              border: `1px solid ${t.accent}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <p style={{ fontSize: '11px', color: t.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              ✦ a memory
            </p>
            <p style={{ fontSize: '12px', color: t.textDim, marginBottom: '8px' }}>
              {new Date(randomMemory.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {randomMemory.mood && ` · ${randomMemory.mood}`}
            </p>
            {randomMemory.title && (
              <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '17px', marginBottom: '8px', fontWeight: '500' }}>
                {randomMemory.title}
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-lora)', color: t.bodyText, fontSize: '15px', lineHeight: '1.8',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const
            }}>
              {randomMemory.body}
            </p>
          </button>
        )}

        {/* Mood filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveMood(null)}
            style={{
              fontSize: '12px', padding: '4px 14px', borderRadius: '20px',
              background: activeMood === null ? t.cardBorder : 'transparent',
              color: activeMood === null ? t.accent : t.textMuted,
              border: activeMood === null ? `1px solid ${t.accent}` : `1px solid ${t.entryBorder}`,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            all
          </button>
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMood(activeMood === m ? null : m)}
              style={{
                fontSize: '12px', padding: '4px 14px', borderRadius: '20px',
                background: activeMood === m ? t.cardBorder : 'transparent',
                color: activeMood === m ? t.accent : t.textMuted,
                border: activeMood === m ? `1px solid ${t.accent}` : `1px solid ${t.entryBorder}`,
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: t.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {activeMood && ` · ${activeMood}`}
        </p>

        {/* Grouped months */}
        {filtered.length === 0 ? (
          <p style={{ color: t.textFaint, textAlign: 'center', marginTop: '4rem', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
            No entries with this mood yet.
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: '1rem' }}>
            {Object.entries(grouped).map(([month, monthEntries]) => {
              const isOpen = openMonths.has(month)
              const typedEntries = monthEntries as any[]
              return (
                <div key={month} style={{ border: `1px solid ${t.cardBorder}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleMonth(month)}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      background: t.cardBg,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <p style={{ fontSize: '12px', color: t.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-lora)' }}>
                      {month}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <p style={{ fontSize: '11px', color: t.textDim }}>
                        {typedEntries.length} {typedEntries.length === 1 ? 'entry' : 'entries'}
                      </p>
                      <p style={{
                        fontSize: '12px', color: t.textDim,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>↓</p>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                      {typedEntries.map((entry: any, index: number) => (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '14px 20px',
                            border: 'none',
                            borderBottom: index < typedEntries.length - 1 ? `1px solid ${t.entryBorder}` : 'none',
                            background: t.entryBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = t.cardBg}
                          onMouseLeave={(e) => e.currentTarget.style.background = t.entryBg}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {entry.title ? (
                                <>
                                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '15px', fontWeight: '500', marginBottom: '3px' }}>
                                    {entry.title}
                                  </p>
                                  <p style={{
                                    fontFamily: 'var(--font-lora)', color: t.entryBodyText, fontSize: '13px', lineHeight: '1.5',
                                    overflow: 'hidden', display: '-webkit-box',
                                    WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const
                                  }}>
                                    {entry.body}
                                  </p>
                                </>
                              ) : (
                                <p style={{
                                  fontFamily: 'var(--font-lora)', color: t.bodyText, fontSize: '14px', lineHeight: '1.6',
                                  overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const
                                }}>
                                  {entry.body}
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.05em', marginBottom: '3px' }}>
                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              {entry.mood && <p style={{ fontSize: '13px' }}>{entry.mood.split(' ')[0]}</p>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full page entry view — slides in like turning a journal page */}
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
          {/* Intensified atmosphere — room feels more intimate */}
          <div style={{
            position: 'fixed',
            bottom: '-100px', left: '-100px',
            width: '600px', height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'glowPulse 1s ease forwards',
            opacity: 0,
          }} />
          <div style={{
            position: 'fixed',
            top: '-80px', right: '-80px',
            width: '500px', height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'glowPulse 1.3s ease forwards',
            opacity: 0,
          }} />

          <div style={{ maxWidth: '560px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>

            {/* Back to memories */}
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: t.textDim, fontSize: '12px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '4rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: 0, fontFamily: 'var(--font-lora)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
            >
              ← memories
            </button>

            {/* Date stamp */}
            <p style={{
              fontSize: '11px', color: t.textDim,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: '1rem',
              animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              {new Date(selectedEntry.created_at).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
              {selectedEntry.mood && ` · ${selectedEntry.mood}`}
            </p>

            {/* Title */}
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

            {/* Pen stroke */}
            <div style={{
              width: '48px', height: '1px',
              background: t.cardBorder, marginBottom: '2.5rem',
              animation: 'fadeUp 0.5s ease 0.2s both',
            }} />

            {/* Body */}
            <p style={{
              fontFamily: 'var(--font-lora)', color: t.inputText,
              fontSize: '19px', lineHeight: '2.2', whiteSpace: 'pre-wrap',
              animation: 'fadeUp 0.6s ease 0.25s both',
            }}>
              {selectedEntry.body}
            </p>

            {/* Open in journal */}
            <div style={{
              marginTop: '4rem', paddingTop: '2rem',
              borderTop: `1px solid ${t.entryBorder}`,
              animation: 'fadeUp 0.5s ease 0.35s both',
            }}>
              <Link
                href={`/journal/${selectedEntry.id}`}
                style={{
                  fontSize: '11px', color: t.textDim,
                  textDecoration: 'none', letterSpacing: '0.08em',
                  textTransform: 'uppercase', transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >
                open in journal →
              </Link>
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