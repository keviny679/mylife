'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

const moodOptions = [
  { value: '😊 good', label: 'good', emoji: '😊' },
  { value: '😐 neutral', label: 'neutral', emoji: '😐' },
  { value: '😔 sad', label: 'sad', emoji: '😔' },
  { value: '❓unsure', label: 'unsure', emoji: '❓' },
]

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
  const { t, mode } = useTheme()

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
      alert('You\'ve written a lot in the last hour. Take a breath and come back soon.')
      setSaving(false)
      return
    }
    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: mood || null,
    })
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
      <main className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>Loading...</p>
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

  // Sky mode uses dark text — button text needs to be readable
  const isSky = mode === 'sky'

  return (
    <main className="min-h-screen relative overflow-hidden transition-colors duration-500" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.inputText,
            fontSize: '26px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
            marginBottom: '0'
          }}>
            MyLife
          </h1>
        </div>

        {/* Streak section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', gap: '8px' }}>
          <p style={{
            color: t.textFaint,
            fontSize: '12px',
            letterSpacing: '0.06em',
            fontStyle: 'italic',
            fontFamily: 'var(--font-lora)',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {entries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {streak > 0 ? (
                <p style={{ color: t.textMuted, fontSize: '12px', letterSpacing: '0.04em', fontFamily: 'var(--font-lora)' }}>
                  {streak} day{streak === 1 ? '' : 's'} · best: {longestStreak}d
                </p>
              ) : (
                <p style={{ color: t.textDim, fontSize: '12px', fontStyle: 'italic', fontFamily: 'var(--font-lora)' }}>
                  write tonight to start a streak
                </p>
              )}
            </div>
          )}

          {/* Weekly dots */}
          {entries.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {currentWeek.map((day, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: day.wrote ? t.accent : t.entryBorder,
                    outline: day.isToday ? `1.5px solid ${t.accent}` : 'none',
                    outlineOffset: '2px',
                    transition: 'all 0.2s ease',
                    opacity: day.wrote ? 1 : 0.5,
                  }} />
                  <p style={{
                    fontSize: '9px',
                    color: day.isToday ? t.accent : t.textDim,
                    letterSpacing: '0.03em',
                  }}>
                    {day.dayLabel}
                  </p>
                </div>
              ))}
            </div>
          )}

          {milestone && (
            <p style={{
              color: t.accent, fontSize: '11px',
              fontFamily: 'var(--font-lora)', fontStyle: 'italic',
              textAlign: 'center', animation: 'fadeIn 1s ease',
              letterSpacing: '0.02em',
            }}>
              {milestone}
            </p>
          )}
        </div>

        {/*
          WRITE AREA
          Folded paper feel — low border radius, hairline border, warm shadow.
          Placeholder text comes from t.prompt — unique per theme.
          Mood pills are small dots with labels, not rounded pills.
          Button says "save this day" — from the PDF design.
        */}
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: `0 2px 12px ${t.shadow}`,
        }}>
          {/* Title input */}
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${t.cardBorder}`,
              color: t.inputText,
              fontFamily: 'var(--font-lora)',
              fontSize: '18px',
              fontStyle: 'italic',
              paddingBottom: '10px',
              marginBottom: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Body textarea — prompt from theme */}
          <textarea
            placeholder={t.prompt}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: t.bodyText,
              fontFamily: 'var(--font-lora)',
              fontSize: '16px',
              lineHeight: '2',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Mood + save */}
          <div style={{
            borderTop: `1px solid ${t.cardBorder}`,
            marginTop: '1rem',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* Mood dots */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {moodOptions.map((m) => {
                const isSelected = mood === m.value
                return (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? '' : m.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isSelected ? t.accent : t.textDim,
                      transition: 'background 0.15s ease',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-lora)',
                      color: isSelected ? t.accent : t.textFaint,
                      transition: 'color 0.15s ease',
                    }}>
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveEntry}
              disabled={saving}
              style={{
                fontSize: '12px',
                padding: '8px 20px',
                borderRadius: '4px',
                background: t.accent,
                color: isSky ? '#ffffff' : t.bg,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-lora)',
                letterSpacing: '0.04em',
                opacity: saving ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {saving ? 'saving...' : 'save this day'}
            </button>
          </div>
        </div>

        {/* Previous entries label */}
        <p style={{
          fontSize: '10px',
          color: t.textDim,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '1rem',
        }}>
          Previous entries
        </p>

        {entries.length === 0 ? (
          <p style={{
            color: t.textFaint, textAlign: 'center', marginTop: '4rem',
            fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: '15px'
          }}>
            Nothing yet. The page is waiting.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {entries.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: t.entryBg,
                  borderTop: index === 0 ? `1px solid ${t.entryBorder}` : 'none',
                  borderBottom: `1px solid ${t.entryBorder}`,
                  borderLeft: `1px solid ${t.entryBorder}`,
                  borderRight: `1px solid ${t.entryBorder}`,
                  borderRadius: index === 0 ? '4px 4px 0 0' : index === entries.length - 1 ? '0 0 4px 4px' : '0',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
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
                          fontSize: '15px',
                          fontWeight: '500',
                          marginBottom: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {entry.title}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-lora)',
                          color: t.entryBodyText,
                          fontSize: '13px',
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
                        fontSize: '14px',
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
                    <p style={{
                      fontSize: '11px',
                      color: t.textDim,
                      letterSpacing: '0.03em',
                      marginBottom: '3px',
                    }}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {entry.mood && (
                      <p style={{ fontSize: '12px', color: t.textFaint, fontFamily: 'var(--font-lora)' }}>
                        {entry.mood.split(' ').slice(1).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
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