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
    const expected = current.toLocaleDateString('en-CA')
    if (date === expected) {
      streak++
      current = new Date(current.getTime() - 86400000)
    } else {
      break
    }
  }

  return streak
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

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data } = await supabase
        .from('entries')
        .select('*')
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
      setTitle('')
      setBody('')
      setMood('')

      const { data } = await supabase
        .from('entries')
        .select('*')
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

  return (
    <main className="min-h-screen relative overflow-hidden transition-colors duration-500" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
<div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none transition-colors duration-500" style={{ width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header — just the logo, hamburger lives in NavDrawer */}
        <div className="flex justify-center items-center mb-8">
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            color: t.accent,
            fontSize: '24px',
          }}>
            MyLife
          </h1>
        </div>

        {/*
          STREAK COUNTER
          calculateStreak() lives above the component — computes consecutive days written.
          Three states: no entries (null), active streak (fire + count), broken streak (nudge message).
          Edge case: streak stays alive if last entry was yesterday, not just today.
          To improve: animate the number, add milestone celebrations (7 days, 30 days, etc.)
        */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', gap: '6px' }}>
          <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {entries.length === 0 ? null : streak > 0 ? (
            <p style={{ color: t.accent, fontSize: '13px', letterSpacing: '0.05em' }}>
              🔥 {streak} day{streak === 1 ? '' : 's'} in a row
            </p>
          ) : (
            <p style={{ color: t.textDim, fontSize: '13px', letterSpacing: '0.05em', fontStyle: 'italic', fontFamily: 'var(--font-lora)' }}>
              write tonight to start a streak
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
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
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
                opacity: saving ? 0.7 : 1,
                transition: 'opacity 0.2s ease'
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
    </main>
  )
}