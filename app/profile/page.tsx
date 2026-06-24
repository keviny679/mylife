'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

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
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
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
    await supabase
      .from('profiles')
      .update({ display_name: newName.trim() })
      .eq('id', profile.id)
    setProfile({ ...profile, display_name: newName.trim() })
    setEditing(false)
    setSaving(false)
  }

  // --- Stats calculations ---

  // Total words across all entries
  const totalWords = entries.reduce((acc, e) => {
    return acc + (e.body ? e.body.trim().split(/\s+/).length : 0)
  }, 0)

  // Days since first entry
  const firstEntry = entries.length > 0
    ? entries[entries.length - 1]
    : null
  const daysSinceFirst = firstEntry
    ? Math.floor((Date.now() - new Date(firstEntry.created_at).getTime()) / 86400000)
    : 0

  // Writing consistency — entries in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentEntries = entries.filter(e => new Date(e.created_at) > thirtyDaysAgo)
  const uniqueRecentDays = new Set(recentEntries.map(e => new Date(e.created_at).toLocaleDateString('en-CA'))).size

  // Most common writing hour
  const hourCounts = entries.reduce((acc: Record<number, number>, e) => {
    const hour = new Date(e.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})
  const peakHour = Object.entries(hourCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0]
  const formatHour = (h: string) => {
    const num = parseInt(h)
    if (num === 0) return 'midnight'
    if (num < 12) return `${num}am`
    if (num === 12) return 'noon'
    return `${num - 12}pm`
  }

  // Longest entry
  const longestEntry = entries.reduce((longest, e) => {
    const count = e.body ? e.body.trim().split(/\s+/).length : 0
    return count > (longest?.wordCount || 0) ? { ...e, wordCount: count } : longest
  }, null as any)

  // Member since
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

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

        {/* Header — avatar, name, email */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontFamily: 'var(--font-lora)',
            color: t.accent,
            fontSize: '28px',
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
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  color: t.inputText, fontFamily: 'var(--font-lora)',
                  fontSize: '22px', textAlign: 'center',
                  outline: 'none', padding: '0 0 4px',
                }}
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
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textDim, fontSize: '12px', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >✎</button>
            </div>
          )}

          <p style={{ color: t.textFaint, fontSize: '13px', fontFamily: 'var(--font-lora)' }}>
            {profile?.email}
          </p>
          <p style={{ color: t.textDim, fontSize: '12px', marginTop: '4px', letterSpacing: '0.05em' }}>
            member since {memberSince}
          </p>
        </div>

        {/* Top stats strip */}
        <div style={{
          display: 'flex', gap: '1px', marginBottom: '1.5rem',
          background: t.cardBorder, borderRadius: '12px',
          overflow: 'hidden', border: `1px solid ${t.cardBorder}`
        }}>
          {[
            { label: 'Entries', value: String(entries.length) },
            { label: 'Words written', value: totalWords.toLocaleString() },
            { label: 'Days journaling', value: String(daysSinceFirst) },
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

        {/* Writing habits card */}
        {entries.length > 0 && (
          <div style={{
            padding: '20px 24px', background: t.cardBg,
            border: `1px solid ${t.cardBorder}`, borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Writing habits
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Peak writing time */}
              {peakHour && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>
                    You write most often at
                  </p>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>
                    {formatHour(peakHour)}
                  </p>
                </div>
              )}

              {/* Consistency */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>
                  Days written in last 30
                </p>
                <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>
                  {uniqueRecentDays} of 30
                </p>
              </div>

              {/* Average entry length */}
              {entries.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '14px' }}>
                    Average entry length
                  </p>
                  <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '14px' }}>
                    {Math.round(totalWords / entries.length)} words
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Longest entry card */}
        {longestEntry && (
          <Link
            href={`/journal/${longestEntry.id}`}
            style={{
              display: 'block', textDecoration: 'none',
              padding: '20px 24px', background: t.cardBg,
              border: `1px solid ${t.cardBorder}`, borderRadius: '12px',
              marginBottom: '1.5rem', transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}
          >
            <p style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Your longest entry — {longestEntry.wordCount} words
            </p>
            {longestEntry.title && (
              <p style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '16px', marginBottom: '6px', fontWeight: '500' }}>
                {longestEntry.title}
              </p>
            )}
            <p style={{ fontFamily: 'var(--font-lora)', color: t.textMuted, fontSize: '13px', marginBottom: '6px' }}>
              {new Date(longestEntry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p style={{
              fontFamily: 'var(--font-lora)', color: t.entryBodyText, fontSize: '14px', lineHeight: '1.6',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const
            }}>
              {longestEntry.body}
            </p>
          </Link>
        )}

        {/* Empty state */}
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