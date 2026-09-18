'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAtmosphere } from '@/lib/atmosphere'
import JournalTabs from '@/components/JournalTabs'

interface CalendarEntry {
  id: string
  title: string | null
  body: string
  mood: string | null
  weather: string | null
  location_name: string | null
  local_date: string | null
  local_time: string | null
  created_at: string
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function entryDateKey(entry: CalendarEntry): string {
  return entry.local_date || dateKey(new Date(entry.created_at))
}

function formatEntryTime(entry: CalendarEntry): string {
  if (entry.local_time) {
    return new Date(`2000-01-01T${entry.local_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
  }
  return new Date(entry.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })
}

export default function CalendarPage() {
  const router = useRouter()
  const { background: bg } = useAtmosphere()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))

  useEffect(() => {
    async function loadEntries() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('entries')
        .select('id, title, body, mood, weather, location_name, local_date, local_time, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEntries((data || []) as CalendarEntry[])
      setLoading(false)
    }

    loadEntries()
  }, [router])

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEntry[]>()
    for (const entry of entries) {
      const key = entryDateKey(entry)
      grouped.set(key, [...(grouped.get(key) || []), entry])
    }
    return grouped
  }, [entries])

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1
      if (day < 1 || day > daysInMonth) return null
      const date = new Date(year, month, day)
      return { day, key: dateKey(date) }
    })
  }, [visibleMonth])

  const selectedEntries = entriesByDate.get(selectedDate) || []
  const selectedLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  function changeMonth(offset: number) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(dateKey(nextMonth))
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: bg.gradient }}>
        <p style={{ color: bg.textColor, fontFamily: 'var(--font-lora)', fontStyle: 'italic', opacity: 0.7 }}>
          Opening your calendar…
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: bg.gradient, transition: 'background 2s ease' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.14) 100%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-8">
        <JournalTabs />

        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{
            color: bg.textColor, opacity: 0.55, fontSize: '10px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Days remembered
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
            <button onClick={() => changeMonth(-1)} aria-label="Previous month" style={{ background: 'none', border: 'none', color: bg.textColor, opacity: 0.6, cursor: 'pointer', fontSize: '22px' }}>‹</button>
            <h1 style={{
              minWidth: '220px', color: bg.textColor,
              fontFamily: 'var(--font-lora)', fontSize: '30px',
              fontWeight: '300', letterSpacing: '-0.02em',
            }}>
              {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            <button onClick={() => changeMonth(1)} aria-label="Next month" style={{ background: 'none', border: 'none', color: bg.textColor, opacity: 0.6, cursor: 'pointer', fontSize: '22px' }}>›</button>
          </div>
        </header>

        <section style={{
          background: bg.cardBg, border: `1px solid ${bg.cardBorder}`,
          borderRadius: '14px', padding: '16px 14px 18px',
          backdropFilter: 'blur(8px)', boxShadow: '0 8px 28px rgba(20,35,50,0.12)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
            {weekdays.map((day, index) => (
              <p key={`${day}-${index}`} style={{ textAlign: 'center', color: bg.dimText, fontSize: '9px', letterSpacing: '0.08em' }}>{day}</p>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '6px' }}>
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} style={{ aspectRatio: '1' }} />
              const hasEntries = entriesByDate.has(day.key)
              const selected = selectedDate === day.key
              const today = day.key === dateKey(new Date())

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDate(day.key)}
                  aria-label={`${day.key}${hasEntries ? ', has journal entries' : ''}`}
                  style={{
                    aspectRatio: '1', width: '100%', borderRadius: '50%',
                    border: today ? `1px solid ${bg.accentColor}` : '1px solid transparent',
                    background: selected ? bg.accentColor : 'transparent',
                    color: selected ? '#ffffff' : bg.secondaryText,
                    cursor: 'pointer', position: 'relative',
                    fontFamily: 'var(--font-lora)', fontSize: '13px',
                  }}
                >
                  {day.day}
                  {hasEntries && !selected && (
                    <span style={{
                      position: 'absolute', bottom: '4px', left: '50%',
                      transform: 'translateX(-50%)', width: '4px', height: '4px',
                      borderRadius: '50%', background: bg.accentColor,
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <p style={{
            color: bg.textColor, opacity: 0.65,
            fontFamily: 'var(--font-lora)', fontSize: '12px',
            fontStyle: 'italic', marginBottom: '10px',
          }}>
            {selectedLabel}
          </p>

          {selectedEntries.length === 0 ? (
            <div style={{
              background: bg.cardBg, border: `1px solid ${bg.cardBorder}`,
              borderRadius: '10px', padding: '1.5rem', textAlign: 'center',
            }}>
              <p style={{ color: bg.dimText, fontFamily: 'var(--font-lora)', fontSize: '13px', fontStyle: 'italic' }}>
                Nothing written on this day.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedEntries.map((entry) => (
                <Link key={entry.id} href={`/journal/${entry.id}`} style={{
                  display: 'block', textDecoration: 'none',
                  background: bg.cardBg, border: `1px solid ${bg.cardBorder}`,
                  borderRadius: '10px', padding: '14px 16px',
                  boxShadow: '0 4px 18px rgba(20,35,50,0.09)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <p style={{ color: bg.dimText, fontSize: '10px', letterSpacing: '0.06em' }}>
                      {formatEntryTime(entry)}
                      {entry.weather && ` · ${entry.weather}`}
                      {entry.location_name && ` · ${entry.location_name}`}
                    </p>
                    {entry.mood && <span style={{ color: bg.accentColor, fontSize: '11px' }}>{entry.mood.split(' ').slice(1).join(' ')}</span>}
                  </div>
                  <p style={{
                    color: bg.secondaryText, fontFamily: 'var(--font-lora)',
                    fontSize: '15px', fontWeight: '500', marginBottom: '4px',
                  }}>
                    {entry.title || 'Untitled entry'}
                  </p>
                  <p style={{
                    color: bg.dimText, fontFamily: 'var(--font-lora)',
                    fontSize: '12px', lineHeight: '1.6', overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {entry.body}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
