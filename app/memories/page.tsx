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
        .from('entries').select('*')
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

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}>
            Memories
          </h1>
          <p style={{
            color: t.textFaint,
            fontSize: '13px',
            fontFamily: 'var(--font-lora)',
            fontStyle: 'italic',
          }}>
            everything you've written, waiting to be found again.
          </p>
        </div>

        {/* Stats strip — minimal, no rounded card feel */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '2rem',
          borderTop: `1px solid ${t.cardBorder}`,
          borderBottom: `1px solid ${t.cardBorder}`,
        }}>
          {[
            { label: 'entries', value: String(entries.length) },
            { label: 'moods logged', value: String(Object.values(moodCounts).reduce((a: number, b: number) => a + b, 0)) },
            { label: 'favorite mood', value: favoriteMood ? favoriteMood.split(' ').slice(1).join(' ') : '—' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1,
              padding: '14px 0',
              textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${t.cardBorder}` : 'none',
            }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: t.inputText,
                fontSize: '18px',
                fontWeight: '500',
                marginBottom: '3px',
              }}>
                {stat.value}
              </p>
              <p style={{
                color: t.textDim,
                fontSize: '10px',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Random memory — folded paper card */}
        {randomMemory && (
          <button
            onClick={() => setSelectedEntry(randomMemory)}
            style={{
              width: '100%',
              textAlign: 'left',
              marginBottom: '2rem',
              padding: '18px 20px',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderLeft: `2px solid ${t.accent}`,
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: `0 2px 10px ${t.shadow}`,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <p style={{
              fontSize: '10px',
              color: t.accent,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'var(--font-lora)',
            }}>
              ✦ a memory, resurfaced
            </p>
            <p style={{
              fontSize: '11px',
              color: t.textFaint,
              fontStyle: 'italic',
              fontFamily: 'var(--font-lora)',
              marginBottom: '10px',
            }}>
              {new Date(randomMemory.created_at).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
              {randomMemory.mood && ` · ${randomMemory.mood.split(' ').slice(1).join(' ')}`}
            </p>
            {randomMemory.title && (
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: t.inputText,
                fontSize: '17px',
                fontWeight: '500',
                marginBottom: '8px',
              }}>
                {randomMemory.title}
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-lora)',
              color: t.bodyText,
              fontSize: '14px',
              lineHeight: '1.8',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {randomMemory.body}
            </p>
          </button>
        )}

        {/* Mood filter — dots like the journal page */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMood(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: activeMood === null ? t.accent : t.textDim,
              transition: 'background 0.15s ease',
            }} />
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-lora)',
              color: activeMood === null ? t.accent : t.textFaint,
              transition: 'color 0.15s ease',
            }}>all</span>
          </button>
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMood(activeMood === m ? null : m)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: activeMood === m ? t.accent : t.textDim,
                transition: 'background 0.15s ease',
              }} />
              <span style={{
                fontSize: '12px',
                fontFamily: 'var(--font-lora)',
                color: activeMood === m ? t.accent : t.textFaint,
                transition: 'color 0.15s ease',
              }}>
                {m.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
        </div>

        {/* Entry count */}
        <p style={{
          fontSize: '10px',
          color: t.textDim,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {activeMood && ` · ${activeMood.split(' ').slice(1).join(' ')}`}
        </p>

        {/* Grouped months */}
        {filtered.length === 0 ? (
          <p style={{
            color: t.textFaint, textAlign: 'center', marginTop: '4rem',
            fontFamily: 'var(--font-lora)', fontStyle: 'italic',
          }}>
            No entries with this mood yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {Object.entries(grouped).map(([month, monthEntries], groupIndex) => {
              const isOpen = openMonths.has(month)
              const typedEntries = monthEntries as any[]
              return (
                <div key={month} style={{
                  borderTop: groupIndex === 0 ? `1px solid ${t.cardBorder}` : 'none',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  borderLeft: `1px solid ${t.cardBorder}`,
                  borderRight: `1px solid ${t.cardBorder}`,
                  borderRadius: groupIndex === 0 ? '4px 4px 0 0' : Object.entries(grouped).length - 1 === groupIndex ? '0 0 4px 4px' : '0',
                  overflow: 'hidden',
                }}>
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleMonth(month)}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: t.cardBg, border: 'none',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <p style={{
                      fontSize: '11px',
                      color: t.textMuted,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-lora)',
                    }}>
                      {month}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <p style={{ fontSize: '10px', color: t.textDim, letterSpacing: '0.06em' }}>
                        {typedEntries.length} {typedEntries.length === 1 ? 'entry' : 'entries'}
                      </p>
                      <p style={{
                        fontSize: '11px', color: t.textDim,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>↓</p>
                    </div>
                  </button>

                  {/* Entries */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                      {typedEntries.map((entry: any, index: number) => (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          style={{
                            width: '100%', textAlign: 'left',
                            display: 'block', padding: '12px 16px',
                            border: 'none',
                            borderBottom: index < typedEntries.length - 1 ? `1px solid ${t.entryBorder}` : 'none',
                            background: t.entryBg,
                            cursor: 'pointer', transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = t.cardBg}
                          onMouseLeave={(e) => e.currentTarget.style.background = t.entryBg}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {entry.title ? (
                                <>
                                  <p style={{
                                    fontFamily: 'var(--font-lora)',
                                    color: t.inputText,
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {entry.title}
                                  </p>
                                  <p style={{
                                    fontFamily: 'var(--font-lora)',
                                    color: t.entryBodyText,
                                    fontSize: '12px',
                                    lineHeight: '1.5',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical' as const,
                                  }}>
                                    {entry.body}
                                  </p>
                                </>
                              ) : (
                                <p style={{
                                  fontFamily: 'var(--font-lora)',
                                  color: t.bodyText,
                                  fontSize: '13px',
                                  lineHeight: '1.6',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical' as const,
                                }}>
                                  {entry.body}
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ fontSize: '11px', color: t.textDim, marginBottom: '2px' }}>
                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              {entry.mood && (
                                <p style={{ fontSize: '11px', color: t.textFaint, fontFamily: 'var(--font-lora)' }}>
                                  {entry.mood.split(' ').slice(1).join(' ')}
                                </p>
                              )}
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

      {/* Full page entry read — page turn */}
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
              ← memories
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
                fontFamily: 'var(--font-lora)', color: t.inputText,
                fontSize: '30px', fontWeight: '600',
                marginBottom: '2rem', lineHeight: '1.25',
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
              fontFamily: 'var(--font-lora)', color: t.bodyText,
              fontSize: '18px', lineHeight: '2.1', whiteSpace: 'pre-wrap',
              animation: 'fadeUp 0.6s ease 0.25s both',
            }}>
              {selectedEntry.body}
            </p>

            <div style={{
              marginTop: '4rem', paddingTop: '1.5rem',
              borderTop: `1px solid ${t.entryBorder}`,
              animation: 'fadeUp 0.5s ease 0.35s both',
            }}>
              <Link
                href={`/journal/${selectedEntry.id}`}
                style={{
                  fontSize: '11px', color: t.textDim,
                  textDecoration: 'none', letterSpacing: '0.08em',
                  textTransform: 'uppercase', transition: 'color 0.15s ease',
                  fontFamily: 'var(--font-lora)',
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