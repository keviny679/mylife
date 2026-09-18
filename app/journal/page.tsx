'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useWeather } from '@/lib/weather-context'
import { formatWeatherStamp, getWeatherCategory } from '@/lib/weather'
import JournalTabs from '@/components/JournalTabs'

const moodOptions = [
  { value: '😊 good', label: 'good' },
  { value: '😐 neutral', label: 'neutral' },
  { value: '😔 sad', label: 'sad' },
  { value: '❓unsure', label: 'unsure' },
]

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function getLocalMoment(date: Date) {
  return {
    localDate: `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`,
    localTime: `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
  }
}

function calculateStreak(entries: any[]): number {
  if (entries.length === 0) return 0
  const uniqueDates = [...new Set(
    entries.map(e => new Date(e.created_at).toLocaleDateString('en-CA'))
  )].sort((a, b) => b.localeCompare(a))
  const today = new Date().toLocaleDateString('en-CA')
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0
  let streak = 0
  let current = new Date(uniqueDates[0])
  for (const date of uniqueDates) {
    if (date === current.toLocaleDateString('en-CA')) {
      streak++
      current = new Date(current.getTime() - 86400000)
    } else break
  }
  return streak
}

function calculateLongestStreak(entries: any[]): number {
  if (entries.length === 0) return 0
  const uniqueDates = [...new Set(
    entries.map(e => new Date(e.created_at).toLocaleDateString('en-CA'))
  )].sort((a, b) => a.localeCompare(b))
  let longest = 1, current = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = (new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i - 1]).getTime()) / 86400000
    if (diff === 1) { current++; longest = Math.max(longest, current) }
    else current = 1
  }
  return longest
}

function getMilestoneMessage(streak: number): string | null {
  const milestones: Record<number, string> = {
    7: 'A full week of showing up.',
    14: "Two weeks. You're building something real.",
    30: 'Thirty days. This is who you are now.',
    60: 'Two months of turning inward every night.',
    100: 'One hundred days. Remarkable.',
    365: "A full year. You've written your life.",
  }
  return milestones[streak] || null
}

export default function Journal() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const {
    weather,
    background,
    timeOfDay,
    cityName,
    locationStatus,
    locationMessage,
    requestLocation,
  } = useWeather()

  const bg = background
  const now = new Date()
  const hour = now.getHours()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('entries').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleSaveEntry() {
    if (!body.trim()) return
    if (body.length > 50000) {
      alert('Entry is too long. Please keep it under 50,000 characters.')
      return
    }
    setSaving(true)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)
    if (count && count >= 10) {
      alert("You've written a lot in the last hour. Take a breath and come back soon.")
      setSaving(false)
      return
    }
    const capturedAt = new Date()
    const localMoment = getLocalMoment(capturedAt)
    const legacyEntry = {
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: mood || null,
      weather: weather ? formatWeatherStamp(weather) : null,
      temperature: weather ? weather.temp : null,
    }
    const momentStamp = {
      ...legacyEntry,
      location_name: cityName || weather?.location || null,
      weather_condition: weather?.condition || null,
      weather_code: weather?.conditionCode || null,
      weather_is_day: weather?.isDay ?? null,
      weather_category: weather
        ? getWeatherCategory(weather.conditionCode, weather.isDay)
        : null,
      local_date: localMoment.localDate,
      local_time: localMoment.localTime,
      timezone: localMoment.timezone,
      time_period: timeOfDay.period,
    }

    let { error } = await supabase.from('entries').insert(momentStamp)

    // Keep writing available while an existing deployment is waiting for the
    // tracked database migration to be applied.
    if (error?.code === 'PGRST204') {
      const fallback = await supabase.from('entries').insert(legacyEntry)
      error = fallback.error
      if (!error) {
        alert('Entry saved. Apply the moment-stamp database migration to preserve location and atmosphere on future entries.')
      }
    }
    if (!error) {
      setTitle('')
      setBody('')
      setMood('')
      const { data } = await supabase
        .from('entries').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setEntries(data || [])
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: bg.gradient }}>
        <p style={{ color: bg.textColor, fontFamily: 'var(--font-lora)', fontStyle: 'italic', opacity: 0.7 }}>
          Loading...
        </p>
      </main>
    )
  }

  const streak = calculateStreak(entries)
  const longestStreak = calculateLongestStreak(entries)
  const milestone = getMilestoneMessage(streak)
  const entryDates = new Set(entries.map(e => new Date(e.created_at).toLocaleDateString('en-CA')))

  // Current week Mon-Sun
  const todayDate = new Date()
  const dayOfWeek = todayDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(todayDate.getTime() + mondayOffset * 86400000)
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 86400000)
    const dateStr = d.toLocaleDateString('en-CA')
    return {
      dateStr,
      dayLabel: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      wrote: entryDates.has(dateStr),
      isToday: dateStr === todayDate.toLocaleDateString('en-CA')
    }
  })

  // Get time-based journal prompt
  const prompts: Record<string, string> = {
    'dawn': 'you woke before the world did.',
    'morning': 'how did the morning find you?',
    'golden-hour-am': 'the light is good right now.',
    'midday': 'where are you in the middle of it all?',
    'afternoon': 'what is the afternoon holding?',
    'golden-hour-pm': 'what stayed with you today?',
    'dusk': 'the day is behind you now.',
    'night': 'just you and the page.',
    'midnight': 'everyone else is asleep.',
  }
  const prompt = prompts[timeOfDay.period] || 'what stayed with you today?'

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: bg.gradient, transition: 'background 2s ease' }}
    >
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)' }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-8">

        <JournalTabs />

        {/*
          HEADER — Your Name style
          Large time display, weather stamp, location
          Feels like the journal app from the movie
        */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Time — large, editorial */}
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: bg.textColor,
            fontSize: '13px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '4px',
          }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Large hour display */}
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: bg.textColor,
            fontSize: '72px',
            fontWeight: '300',
            lineHeight: '1',
            letterSpacing: '-0.04em',
            marginBottom: '4px',
            opacity: 0.9,
          }}>
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>

          {/* Weather + location stamp */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '6px',
          }}>
            {weather ? (
              <>
                <span style={{
                  fontSize: '12px',
                  color: bg.textColor,
                  opacity: 0.65,
                  letterSpacing: '0.08em',
                }}>
                  {weather.condition.toUpperCase()} {weather.temp}°F
                </span>
                <span style={{ color: bg.textColor, opacity: 0.3, fontSize: '10px' }}>·</span>
                <span style={{
                  fontSize: '12px',
                  color: bg.textColor,
                  opacity: 0.65,
                  letterSpacing: '0.06em',
                }}>
                  {cityName || weather.location}
                </span>
              </>
            ) : locationStatus === 'loading' ? (
              <span style={{
                fontSize: '11px', color: bg.textColor,
                opacity: 0.55, letterSpacing: '0.08em',
                fontFamily: 'var(--font-lora)', fontStyle: 'italic',
              }}>
                finding your location…
              </span>
            ) : (
              <button
                onClick={requestLocation}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '11px', color: bg.textColor,
                  opacity: 0.5, letterSpacing: '0.08em',
                  fontFamily: 'var(--font-lora)',
                  textDecoration: 'underline',
                }}
              >
                {locationStatus === 'denied'
                  ? 'location blocked · try again'
                  : locationStatus === 'error'
                    ? 'weather unavailable · try again'
                    : locationStatus === 'unavailable'
                      ? 'location unavailable · try again'
                      : 'enable location for local weather'}
              </button>
            )}
          </div>

          {!weather && locationMessage && locationStatus !== 'loading' && (
            <p style={{
              maxWidth: '360px', margin: '0 auto 8px',
              color: bg.textColor, opacity: 0.5,
              fontSize: '10px', lineHeight: '1.5',
              fontFamily: 'var(--font-lora)',
            }}>
              {locationMessage}
            </p>
          )}

          {/* MyLife label */}
          <p style={{
            fontSize: '11px',
            color: bg.textColor,
            opacity: 0.4,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-lora)',
          }}>
            MyLife
          </p>
        </div>

        {/* Streak strip */}
        {entries.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {streak > 0 ? (
                <p style={{
                  fontSize: '12px', color: bg.textColor,
                  opacity: 0.65, fontFamily: 'var(--font-lora)',
                  letterSpacing: '0.04em',
                }}>
                  {streak}d streak · best {longestStreak}d
                </p>
              ) : (
                <p style={{
                  fontSize: '12px', color: bg.textColor,
                  opacity: 0.5, fontStyle: 'italic',
                  fontFamily: 'var(--font-lora)',
                }}>
                  write today to start a streak
                </p>
              )}
            </div>

            {/* Week dots */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {currentWeek.map((day, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: day.wrote ? bg.accentColor : 'rgba(255,255,255,0.25)',
                    outline: day.isToday ? `1.5px solid ${bg.accentColor}` : 'none',
                    outlineOffset: '2px',
                    transition: 'all 0.2s ease',
                  }} />
                  <p style={{
                    fontSize: '9px',
                    color: bg.textColor,
                    opacity: day.isToday ? 0.9 : 0.4,
                    letterSpacing: '0.02em',
                  }}>
                    {day.dayLabel}
                  </p>
                </div>
              ))}
            </div>

            {milestone && (
              <p style={{
                fontSize: '11px', color: bg.accentColor,
                fontFamily: 'var(--font-lora)', fontStyle: 'italic',
                textAlign: 'center',
              }}>
                {milestone}
              </p>
            )}
          </div>
        )}

        {/* Write area — white card, clean */}
        <div style={{
          background: bg.cardBg,
          border: `1px solid ${bg.cardBorder}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', borderBottom: `1px solid ${bg.cardBorder}`,
              color: bg.secondaryText, fontFamily: 'var(--font-lora)',
              fontSize: '17px', fontStyle: 'italic',
              paddingBottom: '10px', marginBottom: '12px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <textarea
            placeholder={prompt}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', color: bg.secondaryText,
              fontFamily: 'var(--font-lora)', fontSize: '15px',
              lineHeight: '1.9', resize: 'none',
              outline: 'none', boxSizing: 'border-box',
            }}
          />

          {/* Mood + save */}
          <div style={{
            borderTop: `1px solid ${bg.cardBorder}`,
            marginTop: '12px', paddingTop: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {moodOptions.map((m) => {
                const isSelected = mood === m.value
                return (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? '' : m.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: isSelected ? bg.accentColor : bg.dimText,
                      transition: 'background 0.15s ease', flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '11px', fontFamily: 'var(--font-lora)',
                      color: isSelected ? bg.accentColor : bg.dimText,
                      transition: 'color 0.15s ease',
                    }}>
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleSaveEntry}
              disabled={saving}
              style={{
                fontSize: '12px', padding: '7px 18px',
                borderRadius: '20px',
                background: bg.accentColor,
                color: '#ffffff',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-lora)',
                letterSpacing: '0.04em',
                opacity: saving ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {saving ? 'saving...' : 'save this day'}
            </button>
          </div>
        </div>

        {/* Entry list — Your Name style */}
        <p style={{
          fontSize: '10px', color: bg.textColor, opacity: 0.45,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          marginBottom: '8px', fontFamily: 'var(--font-lora)',
        }}>
          Entries
        </p>

        {entries.length === 0 ? (
          <p style={{
            color: bg.textColor, opacity: 0.4,
            textAlign: 'center', marginTop: '3rem',
            fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: '14px',
          }}>
            Nothing yet. The page is waiting.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {entries.map((entry, index) => {
              const entryDate = new Date(entry.created_at)
              const dayNum = entryDate.getDate()
              const dayAbbr = entryDate.toLocaleDateString('en-US', { weekday: 'short' })
              const entryTime = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

              return (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    background: bg.cardBg,
                    borderTop: index === 0 ? `1px solid ${bg.cardBorder}` : 'none',
                    borderBottom: `1px solid ${bg.cardBorder}`,
                    borderLeft: `1px solid ${bg.cardBorder}`,
                    borderRight: `1px solid ${bg.cardBorder}`,
                    borderRadius: index === 0 ? '12px 12px 0 0' : index === entries.length - 1 ? '0 0 12px 12px' : '0',
                    textDecoration: 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'opacity 0.15s ease',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {/* Large day number — Your Name style */}
                  <div style={{
                    width: '64px',
                    flexShrink: 0,
                    padding: '14px 0 14px 16px',
                    borderRight: `1px solid ${bg.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-lora)',
                      color: bg.accentColor,
                      fontSize: '32px',
                      fontWeight: '300',
                      lineHeight: '1',
                      letterSpacing: '-0.02em',
                    }}>
                      {dayNum}
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: bg.dimText,
                      letterSpacing: '0.05em',
                      marginTop: '2px',
                    }}>
                      {dayAbbr.toUpperCase()}
                    </p>
                  </div>

                  {/* Entry content */}
                  <div style={{ flex: 1, padding: '14px 14px 14px 14px', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <p style={{
                        fontSize: '11px', color: bg.dimText,
                        letterSpacing: '0.04em',
                      }}>
                        {entryTime}
                        {entry.weather && ` · ${entry.weather}`}
                        {entry.location_name && ` · ${entry.location_name}`}
                      </p>
                      {entry.mood && (
                        <p style={{ fontSize: '11px', color: bg.dimText }}>
                          {entry.mood.split(' ').slice(1).join(' ')}
                        </p>
                      )}
                    </div>
                    {entry.title ? (
                      <p style={{
                        fontFamily: 'var(--font-lora)',
                        color: bg.secondaryText,
                        fontSize: '14px',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {entry.title}
                      </p>
                    ) : (
                      <p style={{
                        fontFamily: 'var(--font-lora)',
                        color: bg.secondaryText,
                        fontSize: '13px',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                        opacity: 0.8,
                      }}>
                        {entry.body}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </main>
  )
}
