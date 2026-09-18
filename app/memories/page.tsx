'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useWeather } from '@/lib/weather-context'
import JournalTabs from '@/components/JournalTabs'
import type { JournalEntry } from '@/lib/models'

const moods = ['😊 good', '😐 neutral', '😔 sad']

export default function Memories() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [randomMemory, setRandomMemory] = useState<JournalEntry | null>(null)
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const router = useRouter()
  const { background: bg } = useWeather()

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
        const older = data.filter((entry) => new Date(entry.created_at).toDateString() !== today)
        if (older.length > 0) {
          setRandomMemory(older[Math.floor(Math.random() * older.length)])
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  function toggleMonth(month: string) {
    setOpenMonths((prev) => {
      const next = new Set(prev)
      if (next.has(month)) { next.delete(month) } else { next.add(month) }
      return next
    })
  }

  const filtered = activeMood
    ? entries.filter((entry) => entry.mood === activeMood)
    : entries

  const moodCounts = entries.reduce((acc: Record<string, number>, e) => {
    if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {})

  const favoriteMood = Object.entries(moodCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || null

  const grouped = filtered.reduce((groups: Record<string, JournalEntry[]>, entry) => {
    const key = new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
    return groups
  }, {})

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: bg.textColor, fontFamily: 'var(--font-lora)', fontStyle: 'italic', opacity: 0.6 }}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-8">

        <JournalTabs />

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: bg.textColor,
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
            opacity: 0.9,
          }}>
            Memories
          </h1>
          <p style={{
            color: bg.textColor,
            fontSize: '12px',
            fontFamily: 'var(--font-lora)',
            fontStyle: 'italic',
            opacity: 0.5,
          }}>
            everything you&apos;ve written, waiting to be found again.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex',
          background: bg.cardBg,
          borderRadius: '12px',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {[
            { label: 'entries', value: String(entries.length) },
            { label: 'moods', value: String(Object.values(moodCounts).reduce((a: number, b: number) => a + b, 0)) },
            { label: 'favorite', value: favoriteMood ? favoriteMood.split(' ').slice(1).join(' ') : '—' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, padding: '14px 0', textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${bg.cardBorder}` : 'none',
            }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: bg.accentColor,
                fontSize: '20px',
                fontWeight: '500',
                marginBottom: '2px',
              }}>
                {stat.value}
              </p>
              <p style={{
                color: bg.dimText,
                fontSize: '10px',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}>
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
              width: '100%', textAlign: 'left',
              marginBottom: '1.5rem', padding: '16px 18px',
              background: bg.cardBg,
              border: `1px solid ${bg.cardBorder}`,
              borderLeft: `3px solid ${bg.accentColor}`,
              borderRadius: '12px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <p style={{
              fontSize: '10px', color: bg.accentColor,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font-lora)',
            }}>
              ✦ a memory, resurfaced
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: bg.accentColor,
                fontSize: '28px',
                fontWeight: '300',
                lineHeight: '1',
                letterSpacing: '-0.02em',
              }}>
                {new Date(randomMemory.created_at).getDate()}
              </p>
              <div>
                <p style={{ fontSize: '12px', color: bg.secondaryText, fontFamily: 'var(--font-lora)', fontWeight: '500' }}>
                  {new Date(randomMemory.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '11px', color: bg.dimText, fontStyle: 'italic', fontFamily: 'var(--font-lora)' }}>
                  {new Date(randomMemory.created_at).toLocaleDateString('en-US', { weekday: 'long' })}
                  {randomMemory.mood && ` · ${randomMemory.mood.split(' ').slice(1).join(' ')}`}
                </p>
              </div>
            </div>
            {randomMemory.title && (
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: bg.secondaryText,
                fontSize: '15px', fontWeight: '500', marginBottom: '6px',
              }}>
                {randomMemory.title}
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-lora)', color: bg.dimText,
              fontSize: '13px', lineHeight: '1.7',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>
              {randomMemory.body}
            </p>
          </button>
        )}

        {/* Mood filter */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[{ value: null, label: 'all' }, ...moods.map(m => ({ value: m, label: m.split(' ').slice(1).join(' ') }))].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMood(item.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: activeMood === item.value ? bg.accentColor : 'rgba(255,255,255,0.3)',
                transition: 'background 0.15s ease',
              }} />
              <span style={{
                fontSize: '12px', fontFamily: 'var(--font-lora)',
                color: activeMood === item.value ? bg.textColor : bg.textColor,
                opacity: activeMood === item.value ? 0.9 : 0.45,
                transition: 'opacity 0.15s ease',
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Entry count */}
        <p style={{
          fontSize: '10px', color: bg.textColor, opacity: 0.4,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          marginBottom: '1rem', fontFamily: 'var(--font-lora)',
        }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {activeMood && ` · ${activeMood.split(' ').slice(1).join(' ')}`}
        </p>

        {/* Grouped months — Your Name style with large day numbers */}
        {filtered.length === 0 ? (
          <p style={{
            color: bg.textColor, opacity: 0.4, textAlign: 'center', marginTop: '4rem',
            fontFamily: 'var(--font-lora)', fontStyle: 'italic',
          }}>
            No entries with this mood yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(grouped).map(([month, monthEntries]) => {
              const isOpen = openMonths.has(month)
              const typedEntries = monthEntries
              return (
                <div key={month} style={{
                  background: bg.cardBg,
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  {/* Month header */}
                  <button
                    onClick={() => toggleMonth(month)}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <p style={{
                      fontSize: '11px', color: bg.secondaryText,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontFamily: 'var(--font-lora)', opacity: 0.7,
                    }}>
                      {month}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <p style={{ fontSize: '10px', color: bg.dimText, letterSpacing: '0.06em' }}>
                        {typedEntries.length} {typedEntries.length === 1 ? 'entry' : 'entries'}
                      </p>
                      <p style={{
                        fontSize: '11px', color: bg.dimText,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>↓</p>
                    </div>
                  </button>

                  {/* Entries — Your Name style */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${bg.cardBorder}` }}>
                      {typedEntries.map((entry, index) => {
                        const entryDate = new Date(entry.created_at)
                        const dayNum = entryDate.getDate()
                        const dayAbbr = entryDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                        const entryTime = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        return (
                          <button
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            style={{
                              width: '100%', textAlign: 'left',
                              display: 'flex', alignItems: 'center',
                              border: 'none',
                              borderBottom: index < typedEntries.length - 1 ? `1px solid ${bg.cardBorder}` : 'none',
                              background: 'transparent',
                              cursor: 'pointer', transition: 'opacity 0.15s ease',
                              overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            {/* Large day number */}
                            <div style={{
                              width: '60px', flexShrink: 0,
                              padding: '12px 0 12px 16px',
                              borderRight: `1px solid ${bg.cardBorder}`,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <p style={{
                                fontFamily: 'var(--font-lora)',
                                color: bg.accentColor,
                                fontSize: '28px', fontWeight: '300',
                                lineHeight: '1', letterSpacing: '-0.02em',
                              }}>
                                {dayNum}
                              </p>
                              <p style={{ fontSize: '9px', color: bg.dimText, letterSpacing: '0.05em', marginTop: '2px' }}>
                                {dayAbbr}
                              </p>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <p style={{ fontSize: '11px', color: bg.dimText, letterSpacing: '0.03em' }}>
                                  {entryTime}
                                  {entry.weather && ` · ${entry.weather}`}
                                  {entry.location_name && ` · ${entry.location_name}`}
                                </p>
                                {entry.mood && (
                                  <p style={{ fontSize: '10px', color: bg.dimText, fontFamily: 'var(--font-lora)' }}>
                                    {entry.mood.split(' ').slice(1).join(' ')}
                                  </p>
                                )}
                              </div>
                              {entry.title ? (
                                <p style={{
                                  fontFamily: 'var(--font-lora)',
                                  color: bg.secondaryText,
                                  fontSize: '14px', fontWeight: '500',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {entry.title}
                                </p>
                              ) : (
                                <p style={{
                                  fontFamily: 'var(--font-lora)',
                                  color: bg.secondaryText,
                                  fontSize: '13px', lineHeight: '1.5', opacity: 0.8,
                                  overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const,
                                }}>
                                  {entry.body}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full page entry read */}
      {selectedEntry && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: bg.gradient, overflowY: 'auto',
          animation: 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />

          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem 6rem', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: bg.textColor, fontSize: '11px', opacity: 0.5,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '2rem', display: 'flex', alignItems: 'center',
                gap: '6px', padding: 0, fontFamily: 'var(--font-lora)',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              ← memories
            </button>

            {/* Date card */}
            <div style={{
              background: bg.cardBg, borderRadius: '16px 16px 0 0',
              padding: '1.25rem', backdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${bg.cardBorder}`,
              animation: 'fadeUp 0.4s ease 0.05s both',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <p style={{
                  fontFamily: 'var(--font-lora)', color: bg.accentColor,
                  fontSize: '48px', fontWeight: '300', lineHeight: '1',
                  letterSpacing: '-0.03em', flexShrink: 0,
                }}>
                  {new Date(selectedEntry.created_at).getDate()}
                </p>
                <div style={{ paddingTop: '4px' }}>
                  <p style={{ fontFamily: 'var(--font-lora)', color: bg.secondaryText, fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>
                    {new Date(selectedEntry.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p style={{ fontSize: '11px', color: bg.dimText, marginBottom: '4px' }}>
                    {new Date(selectedEntry.created_at).toLocaleDateString('en-US', { weekday: 'long' })},{' '}
                    {new Date(selectedEntry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {(selectedEntry.weather || selectedEntry.location_name) && (
                    <p style={{ fontSize: '10px', color: bg.dimText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {[selectedEntry.weather, selectedEntry.location_name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {selectedEntry.mood && (
                    <p style={{ fontSize: '11px', color: bg.accentColor, fontStyle: 'italic', fontFamily: 'var(--font-lora)', marginTop: '3px' }}>
                      {selectedEntry.mood.split(' ').slice(1).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content card */}
            <div style={{
              background: bg.cardBg, borderRadius: '0 0 16px 16px',
              padding: '1.25rem', backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              marginBottom: '1rem',
              animation: 'fadeUp 0.4s ease 0.1s both',
            }}>
              {selectedEntry.title && (
                <h2 style={{
                  fontFamily: 'var(--font-lora)', color: bg.secondaryText,
                  fontSize: '22px', fontWeight: '600',
                  marginBottom: '1rem', lineHeight: '1.25',
                }}>
                  {selectedEntry.title}
                </h2>
              )}
              <div style={{ width: '24px', height: '1px', background: bg.cardBorder, marginBottom: '1rem' }} />
              <p style={{
                fontFamily: 'var(--font-lora)', color: bg.secondaryText,
                fontSize: '15px', lineHeight: '2', whiteSpace: 'pre-wrap', opacity: 0.85,
              }}>
                {selectedEntry.body}
              </p>
            </div>

            <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <Link
                href={`/journal/${selectedEntry.id}`}
                style={{
                  fontSize: '11px', color: bg.textColor, opacity: 0.45,
                  textDecoration: 'none', letterSpacing: '0.08em',
                  textTransform: 'uppercase', transition: 'opacity 0.15s ease',
                  fontFamily: 'var(--font-lora)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.45'}
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
      `}</style>
    </main>
  )
}
