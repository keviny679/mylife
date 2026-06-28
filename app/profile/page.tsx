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

        {/* Header — name large, email and member since quiet below */}
        <div style={{ marginBottom: '2.5rem' }}>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                autoFocus
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  color: t.inputText, fontFamily: 'var(--font-lora)',
                  fontSize: '28px', fontWeight: '600',
                  letterSpacing: '-0.01em',
                  outline: 'none', padding: '0 0 4px',
                  flex: 1,
                }}
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                style={{
                  background: t.accent, color: t.bg, border: 'none',
                  borderRadius: '3px', padding: '5px 12px',
                  cursor: 'pointer', fontSize: '11px',
                  fontFamily: 'var(--font-lora)', letterSpacing: '0.04em',
                }}
              >
                {saving ? '...' : 'save'}
              </button>
              <button
                onClick={() => { setEditing(false); setNewName(profile?.display_name || '') }}
                style={{
                  background: 'none', color: t.textDim, border: 'none',
                  cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-lora)',
                }}
              >
                cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{
                fontFamily: 'var(--font-lora)',
                color: t.inputText,
                fontSize: '28px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
              }}>
                {profile?.display_name || 'Anonymous'}
              </h1>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.textDim, fontSize: '13px',
                  transition: 'color 0.15s ease', padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >
                ✎
              </button>
            </div>
          )}
          <p style={{
            color: t.textFaint, fontSize: '12px',
            fontFamily: 'var(--font-lora)', fontStyle: 'italic',
          }}>
            {profile?.email} · member since {memberSince}
          </p>
        </div>

        {/* Stats — same borderline style as memories */}
        <div style={{
          display: 'flex',
          borderTop: `1px solid ${t.cardBorder}`,
          borderBottom: `1px solid ${t.cardBorder}`,
          marginBottom: '2rem',
        }}>
          {[
            { label: 'entries', value: String(entries.length) },
            { label: 'words', value: totalWords.toLocaleString() },
            { label: 'streak', value: streak > 0 ? `${streak}d` : '—' },
            { label: 'best', value: longestStreak > 0 ? `${longestStreak}d` : '—' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, padding: '14px 0', textAlign: 'center',
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
                color: t.textDim, fontSize: '10px',
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Writing habits */}
        {entries.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '10px', color: t.textDim,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Writing habits
            </p>
            <div style={{
              border: `1px solid ${t.cardBorder}`,
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: `0 2px 8px ${t.shadow}`,
            }}>
              {[
                peakHour ? { label: 'You write most often at', value: formatHour(peakHour) } : null,
                { label: 'Days written in last 30', value: `${uniqueRecentDays} of 30` },
                entries.length > 0 ? { label: 'Average entry length', value: `${Math.round(totalWords / entries.length)} words` } : null,
              ].filter(Boolean).map((row, i, arr) => (
                <div
                  key={row!.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: i % 2 === 0 ? t.entryBg : t.cardBg,
                    borderBottom: i < arr.length - 1 ? `1px solid ${t.entryBorder}` : 'none',
                  }}
                >
                  <p style={{
                    fontFamily: 'var(--font-lora)',
                    color: t.textMuted,
                    fontSize: '13px',
                  }}>
                    {row!.label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-lora)',
                    color: t.inputText,
                    fontSize: '13px',
                    fontWeight: '500',
                  }}>
                    {row!.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Longest entry */}
        {longestEntry && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '10px', color: t.textDim,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Your longest entry — {longestEntry.wordCount} words
            </p>
            <Link
              href={`/journal/${longestEntry.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                padding: '16px',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderLeft: `2px solid ${t.accent}`,
                borderRadius: '4px',
                boxShadow: `0 2px 8px ${t.shadow}`,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {longestEntry.title && (
                <p style={{
                  fontFamily: 'var(--font-lora)',
                  color: t.inputText,
                  fontSize: '15px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}>
                  {longestEntry.title}
                </p>
              )}
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: t.textFaint,
                fontSize: '11px',
                fontStyle: 'italic',
                marginBottom: '8px',
              }}>
                {new Date(longestEntry.created_at).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: t.entryBodyText,
                fontSize: '13px',
                lineHeight: '1.7',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
              }}>
                {longestEntry.body}
              </p>
            </Link>
          </div>
        )}

        {entries.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-lora)',
            color: t.textFaint,
            fontSize: '15px',
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: '3rem',
          }}>
            Start writing to see your story unfold here.
          </p>
        )}

      </div>
    </main>
  )
}