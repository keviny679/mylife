'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

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

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { t } = useTheme()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      const { data: entriesData } = await supabase
        .from('entries').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProfile({ ...profileData, email: user.email })
      setNewName(profileData?.display_name || '')
      setEntries(entriesData || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveName() {
    if (!newName.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ display_name: newName.trim() }).eq('id', profile.id)
    setProfile({ ...profile, display_name: newName.trim() })
    setEditing(false)
    setSaving(false)
  }

  const totalWords = entries.reduce((acc, e) => acc + (e.body ? e.body.trim().split(/\s+/).length : 0), 0)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentEntries = entries.filter(e => new Date(e.created_at) > thirtyDaysAgo)
  const uniqueRecentDays = new Set(recentEntries.map(e => new Date(e.created_at).toLocaleDateString('en-CA'))).size
  const hourCounts = entries.reduce((acc: Record<number, number>, e) => {
    const hour = new Date(e.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})
  const peakHour = Object.entries(hourCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0]
  const formatHour = (h: string) => {
    const num = parseInt(h)
    if (num === 0) return 'midnight'
    if (num < 12) return `${num}am`
    if (num === 12) return 'noon'
    return `${num - 12}pm`
  }
  const longestEntry = entries.reduce((longest, e) => {
    const count = e.body ? e.body.trim().split(/\s+/).length : 0
    return count > (longest?.wordCount || 0) ? { ...e, wordCount: count } : longest
  }, null as any)
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'
  const streak = calculateStreak(entries)
  const longestStreak = calculateLongestStreak(entries)

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

        {/* Avatar + name + email */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: t.cardBg, border: `1px solid ${t.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontFamily: 'var(--font-lora)',
            color: t.accent, fontSize: '28px',
          }}>
            {profile?.display_name?.[0]?.toUpperCase() || '?'}
          </div>

          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                autoFocus
                style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${t.cardBorder}`, color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '22px', textAlign: 'center', outline: 'none', padding: '0 0 4px' }}
              />
              <button onClick={handleSaveName} disabled={saving} style={{ background: t.accentStrong, color: t.bg, border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-lora)' }}>
                {saving ? '...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setNewName(profile?.display_name || '') }} style={{ background: 'none', color: t.textDim, border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-lora)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '22px', fontWeight: '500' }}>
                {profile?.display_name || 'Anonymous'}
              </h1>
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textDim, fontSize: '12px', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >✎</button>
            </div>
          )}

          <p style={{ color: t.textFaint, fontSize: '13px', fontFamily: 'var(--font-lora)' }}>{profile?.email}</p>
          <p style={{ color: t.textDim, fontSize: '12px', marginTop: '4px', letterSpacing: '0.05em' }}>member since {memberSince}</p>
        </div>

        {/* Stats strip — 4 boxes */}
        <div style={{ display: 'flex', gap: '1px', marginBottom: '1.5rem', background: t.cardBorder, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${t.cardBorder}` }}>
          {[
            { label: 'Entries', value: String(entries.length) },
            { label: 'Words', value: totalWords.toLocaleString() },
            { label: 'Streak', value: streak > 0 ? `${streak}d` : '—' },
            { label: 'Best streak', value: longestStreak > 0 ? `${longestStreak}d` : '—' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, padding: '16px', background: t.cardBg, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '18px', fontWeight: '500', marginBottom: '4px' }}>
                {stat.value}
              </p>
              <p style={{ color: t.textDim, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Writing habits */}
        {entries.length > 0 && (
          <div style={{ padding: '20px 24px', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '12px', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Writing habits
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {peakHour && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>You write most often at</p>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>{formatHour(peakHour)}</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>Days written in last 30</p>
                <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>{uniqueRecentDays} of 30</p>
              </div>
              {entries.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>Average entry length</p>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>{Math.round(totalWords / entries.length)} words</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Longest entry */}
        {longestEntry && (
          <Link
            href={`/journal/${longestEntry.id}`}
            style={{ display: 'block', textDecoration: 'none', padding: '20px 24px', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '12px', marginBottom: '1.5rem', transition: 'border-color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}
          >
            <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Your longest entry — {longestEntry.wordCount} words
            </p>
            {longestEntry.title && (
              <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '16px', marginBottom: '6px', fontWeight: '500' }}>{longestEntry.title}</p>
            )}
            <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '13px', marginBottom: '6px' }}>
              {new Date(longestEntry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p style={{ fontFamily: 'var(--font-lora)', color: t.entryBodyText, fontSize: '14px', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {longestEntry.body}
            </p>
          </Link>
        )}

        {entries.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-lora)', color: t.textFaint, fontSize: '15px', fontStyle: 'italic' }}>
              Start writing to see your story unfold here.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}