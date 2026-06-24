'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

const moods = ['😊 good', '😐 neutral', '😔 sad', '❓unsure']

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
  const { t } = useTheme()

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
    setSaving(true)
    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: mood || null,
    })
    if (!error) {
      setTitle(''); setBody(''); setMood('')
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
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)' }}>Loading...</p>
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

  return (
    <main className="min-h-screen relative overflow-hidden transition-colors duration-500" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none transition-colors duration-500" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        <div className="flex justify-center items-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '24px' }}>MyLife</h1>
        </div>

        {/*
          STREAK SECTION
          Date, current streak + personal best, Mon-Sun week dots, milestone message.
          calculateStreak() — consecutive days ending today or yesterday.
          calculateLongestStreak() — all-time personal best.
          getMilestoneMessage() — quiet celebration at key milestones (7, 14, 30, 60, 100, 365).
          To improve: animate dots on save, expand to month view on click.
        */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '10px' }}>
          <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {entries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {streak > 0 ? (
                <p style={{ color: t.accent, fontSize: '13px', letterSpacing: '0.05em' }}>
                  🔥 {streak} day{streak === 1 ? '' : 's'} in a row
                </p>
              ) : (
                <p style={{ color: t.textDim, fontSize: '13px', fontStyle: 'italic', fontFamily: 'var(--font-lora)' }}>
                  write tonight to start a streak
                </p>
              )}
              {longestStreak > 0 && (
                <>
                  <span style={{ color: t.textDim, fontSize: '11px' }}>·</span>
                  <p style={{ color: t.textDim, fontSize: '12px' }}>best: {longestStreak}d</p>
                </>
              )}
            </div>
          )}

          {entries.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '2px' }}>
              {currentWeek.map((day, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: day.wrote ? t.accent : t.entryBorder,
                    boxShadow: day.wrote ? `0 0 8px ${t.accent}60` : 'none',
                    outline: day.isToday ? `2px solid ${t.accent}` : 'none',
                    outlineOffset: '2px',
                    transition: 'all 0.2s ease'
                  }} />
                  <p style={{
                    fontSize: '11px',
                    color: day.isToday ? t.accent : t.textDim,
                    fontWeight: day.isToday ? '600' : '400'
                  }}>
                    {day.dayLabel}
                  </p>
                </div>
              ))}
            </div>
          )}

          {milestone && (
            <p style={{
              color: t.accent, fontSize: '12px',
              fontFamily: 'var(--font-lora)', fontStyle: 'italic',
              textAlign: 'center', animation: 'fadeIn 1s ease'
            }}>
              {milestone}
            </p>
          )}
        </div>

        <div className="rounded-xl p-6 mb-6 transition-colors duration-500" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${t.cardBorder}`, color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '20px', paddingBottom: '12px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="How did today go..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            style={{ width: '100%', background: 'transparent', border: 'none', color: t.bodyText, fontFamily: 'var(--font-lora)', fontSize: '16px', lineHeight: '1.9', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          />
          <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
            <div className="flex gap-2 flex-wrap">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? '' : m)}
                  style={{
                    fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
                    background: mood === m ? t.cardBorder : t.bg,
                    color: mood === m ? t.accent : t.textMuted,
                    border: mood === m ? `1px solid ${t.accent}` : `1px solid ${t.entryBorder}`,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveEntry}
              disabled={saving}
              style={{
                fontSize: '13px', padding: '8px 20px', borderRadius: '8px',
                background: t.accentStrong, color: t.bg, border: 'none',
                cursor: 'pointer', fontWeight: '500', marginLeft: '12px', whiteSpace: 'nowrap',
                opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s ease'
              }}
            >
              {saving ? 'Saving...' : 'Save entry'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Previous entries</p>

        {entries.length === 0 ? (
          <p style={{ color: t.textFaint, textAlign: 'center', marginTop: '4rem', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
            No entries yet. Start writing your first one.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="rounded-xl p-6 transition-all duration-200"
                style={{ display: 'block', background: t.entryBg, border: `1px solid ${t.entryBorder}`, cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = t.entryBorder}
              >
                <p style={{ fontSize: '12px', color: t.textDim, marginBottom: '6px' }}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {entry.mood && ` · ${entry.mood}`}
                </p>
                {entry.title && (
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '17px', marginBottom: '6px', fontWeight: '500' }}>{entry.title}</p>
                )}
                <p style={{ fontFamily: 'var(--font-lora)', color: t.entryBodyText, fontSize: '15px', lineHeight: '1.7' }}>{entry.body}</p>
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