'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useWeather } from '@/lib/weather-context'
import type { JournalEntry } from '@/lib/models'

const BLOCKED_TERMS = [
  'nigger', 'nigga', 'faggot', 'chink', 'spic', 'kike',
  'tranny', 'retard', 'cunt', 'whore', 'rape',
]

function containsBlockedContent(text: string): boolean {
  return BLOCKED_TERMS.some(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'i')
    return regex.test(text)
  })
}

export default function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const router = useRouter()
  const { background: bg } = useWeather()

  useEffect(() => {
    async function getEntry() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase
        .from('entries').select('*')
        .eq('id', id).eq('user_id', user.id).single()
      if (error || !data) {
        setNotFound(true)
      } else {
        setEntry(data)
        setEditTitle(data.title || '')
        setEditBody(data.body || '')
      }
      setLoading(false)
    }
    getEntry()
  }, [id, router])

  async function handleDelete() {
    if (!entry) return
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('entries').delete().eq('id', entry.id)
    router.push('/journal')
  }

  async function handleSaveEdit() {
    if (!entry || !editBody.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('entries')
      .update({ title: editTitle.trim() || null, body: editBody.trim() })
      .eq('id', entry.id)
    if (!error) {
      setEntry({ ...entry, title: editTitle.trim() || null, body: editBody.trim() })
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function handleToggleShare() {
    if (!entry) return
    setSharing(true)
    if (entry.is_public) {
      if (!confirm('Remove this entry from the community feed?')) { setSharing(false); return }
      const { error } = await supabase
        .from('entries').update({ is_public: false, shared_at: null }).eq('id', entry.id)
      if (!error) setEntry({ ...entry, is_public: false, shared_at: null })
    } else {
      if (!confirm('Share this entry anonymously on the community feed this week? It disappears after 7 days.')) { setSharing(false); return }
      const fullText = `${entry.title || ''} ${entry.body}`
      if (containsBlockedContent(fullText)) {
        alert("This entry contains content that isn't allowed on the community feed.")
        setSharing(false)
        return
      }
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data: recentShared } = await supabase
        .from('entries').select('id')
        .eq('user_id', entry.user_id).eq('is_public', true)
        .gte('shared_at', sevenDaysAgo)
      if (recentShared && recentShared.length > 0) {
        alert("You've already shared an entry this week. Unshare your current entry first.")
        setSharing(false)
        return
      }
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('entries').update({ is_public: true, shared_at: now }).eq('id', entry.id)
      if (!error) setEntry({ ...entry, is_public: true, shared_at: now })
    }
    setSharing(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
      >
        <p style={{ color: bg.textColor, fontFamily: 'var(--font-lora)', fontStyle: 'italic', opacity: 0.6 }}>
          Loading...
        </p>
      </main>
    )
  }

  if (notFound || !entry) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center"
      >
        <p style={{ color: bg.textColor, fontFamily: 'var(--font-lora)', fontStyle: 'italic', opacity: 0.6, marginBottom: '1rem' }}>
          Entry not found.
        </p>
        <Link href="/journal" style={{ color: bg.accentColor, fontFamily: 'var(--font-lora)', fontSize: '13px', textDecoration: 'none' }}>
          ← back to journal
        </Link>
      </main>
    )
  }

  const entryDate = new Date(entry.created_at)
  const dayNum = entryDate.getDate()
  const monthName = entryDate.toLocaleDateString('en-US', { month: 'long' })
  const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'long' })
  const yearNum = entryDate.getFullYear()
  const entryTime = entry.local_time
    ? new Date(`2000-01-01T${entry.local_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)' }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-8">

        {/* Back */}
        <Link
          href="/journal"
          style={{
            display: 'inline-block',
            fontSize: '11px',
            color: bg.textColor,
            opacity: 0.5,
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
            fontFamily: 'var(--font-lora)',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
        >
          ← journal
        </Link>

        {/*
          DATE HEADER — Your Name style
          Large day number, month, day name, time, weather stamp
          This is the memory — you remember when and where you were
        */}
        <div style={{
          background: bg.cardBg,
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${bg.cardBorder}`,
          marginBottom: '0',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Large day number */}
            <div style={{ flexShrink: 0 }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: bg.accentColor,
                fontSize: '56px',
                fontWeight: '300',
                lineHeight: '1',
                letterSpacing: '-0.03em',
              }}>
                {dayNum}
              </p>
            </div>

            {/* Date details */}
            <div style={{ paddingTop: '6px', flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-lora)',
                color: bg.secondaryText,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '2px',
              }}>
                {monthName} {yearNum}
              </p>
              <p style={{
                fontSize: '12px',
                color: bg.dimText,
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}>
                {dayName}, {entryTime}
              </p>
              {/* Weather stamp from when entry was written */}
              {(entry.weather || entry.location_name) && (
                <p style={{
                  fontSize: '11px',
                  color: bg.dimText,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-lora)',
                }}>
                  {[entry.weather, entry.location_name].filter(Boolean).join(' · ')}
                </p>
              )}
              {entry.mood && (
                <p style={{
                  fontSize: '11px',
                  color: bg.accentColor,
                  letterSpacing: '0.04em',
                  marginTop: '4px',
                  fontFamily: 'var(--font-lora)',
                  fontStyle: 'italic',
                }}>
                  {entry.mood.split(' ').slice(1).join(' ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Entry content card */}
        <div style={{
          background: bg.cardBg,
          borderRadius: '0 0 16px 16px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          marginBottom: '1rem',
        }}>
          {isEditing ? (
            <>
              <input
                type="text"
                placeholder="Title (optional)"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${bg.cardBorder}`,
                  color: bg.secondaryText, fontFamily: 'var(--font-lora)',
                  fontSize: '22px', fontStyle: 'italic',
                  paddingBottom: '10px', marginBottom: '1.25rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={12}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: bg.secondaryText, fontFamily: 'var(--font-lora)',
                  fontSize: '16px', lineHeight: '2',
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${bg.cardBorder}` }}>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{
                    fontSize: '12px', padding: '8px 20px', borderRadius: '20px',
                    background: bg.accentColor, color: '#ffffff', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-lora)',
                    opacity: saving ? 0.7 : 1, letterSpacing: '0.03em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {saving ? 'saving...' : 'save changes'}
                </button>
                <button
                  onClick={() => { setEditTitle(entry.title || ''); setEditBody(entry.body || ''); setIsEditing(false) }}
                  style={{
                    fontSize: '12px', padding: '8px 18px', borderRadius: '20px',
                    background: 'transparent', color: bg.dimText,
                    border: `1px solid ${bg.cardBorder}`,
                    cursor: 'pointer', fontFamily: 'var(--font-lora)',
                  }}
                >
                  cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {entry.title && (
                <h1 style={{
                  fontFamily: 'var(--font-lora)',
                  color: bg.secondaryText,
                  fontSize: '26px',
                  fontWeight: '600',
                  marginBottom: '1.25rem',
                  lineHeight: '1.25',
                  letterSpacing: '-0.01em',
                }}>
                  {entry.title}
                </h1>
              )}

              <div style={{
                width: '28px', height: '1px',
                background: bg.cardBorder,
                marginBottom: '1.25rem',
              }} />

              <div style={{
                fontFamily: 'var(--font-lora)',
                color: bg.secondaryText,
                fontSize: '16px',
                lineHeight: '2',
                whiteSpace: 'pre-wrap',
                opacity: 0.85,
              }}>
                {entry.body}
              </div>
            </>
          )}
        </div>

        {/* Actions — share, edit, delete */}
        {!isEditing && (
          <div style={{
            background: bg.cardBg,
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>

            {/* Share */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{
                  fontSize: '11px', color: bg.secondaryText,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  marginBottom: '2px', opacity: 0.7,
                }}>
                  {entry.is_public ? '✦ shared this week' : 'share this week'}
                </p>
                <p style={{
                  fontSize: '11px', color: bg.dimText,
                  fontFamily: 'var(--font-lora)', fontStyle: 'italic',
                }}>
                  {entry.is_public
                    ? 'visible on community feed anonymously'
                    : 'one entry per week · anonymous'}
                </p>
              </div>
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                style={{
                  fontSize: '11px', padding: '6px 14px',
                  borderRadius: '20px',
                  background: entry.is_public ? bg.accentColor : 'transparent',
                  color: entry.is_public ? '#ffffff' : bg.dimText,
                  border: `1px solid ${entry.is_public ? bg.accentColor : bg.cardBorder}`,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-lora)',
                  transition: 'all 0.15s ease',
                  marginLeft: '16px', whiteSpace: 'nowrap',
                  boxShadow: entry.is_public ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {sharing ? '...' : entry.is_public ? 'unshare' : 'share'}
              </button>
            </div>

            <div style={{ height: '1px', background: bg.cardBorder }} />

            {/* Edit + delete */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  fontSize: '11px', color: bg.dimText, background: 'none',
                  border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-lora)',
                  transition: 'color 0.15s ease', padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = bg.accentColor}
                onMouseLeave={(e) => e.currentTarget.style.color = bg.dimText}
              >
                ✎ edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontSize: '11px', color: bg.dimText, background: 'none',
                  border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-lora)',
                  transition: 'color 0.15s ease', padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c05050'}
                onMouseLeave={(e) => e.currentTarget.style.color = bg.dimText}
              >
                {deleting ? 'deleting...' : '× delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
