'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

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
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const router = useRouter()
  const { t } = useTheme()

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
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('entries').delete().eq('id', entry.id)
    router.push('/journal')
  }

  async function handleSaveEdit() {
    if (!editBody.trim()) return
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
        alert('This entry contains content that isn\'t allowed on the community feed.')
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
      <main className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>Loading...</p>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', fontStyle: 'italic', marginBottom: '1rem' }}>Entry not found.</p>
        <Link href="/journal" style={{ color: t.accent, fontFamily: 'var(--font-lora)', fontSize: '13px' }}>← back to journal</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          href="/journal"
          style={{
            display: 'inline-block',
            fontSize: '11px',
            color: t.textDim,
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '2.5rem',
            fontFamily: 'var(--font-lora)',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
          onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
        >
          ← journal
        </Link>

        {/* Date and mood */}
        <p style={{
          fontSize: '11px',
          color: t.textFaint,
          letterSpacing: '0.08em',
          fontStyle: 'italic',
          fontFamily: 'var(--font-lora)',
          marginBottom: '1.5rem',
        }}>
          {new Date(entry.created_at).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
          })}
          {entry.mood && ` · ${entry.mood.split(' ').slice(1).join(' ')}`}
        </p>

        {isEditing ? (
          /* Edit mode */
          <>
            <input
              type="text"
              placeholder="Title (optional)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${t.cardBorder}`,
                color: t.inputText, fontFamily: 'var(--font-lora)',
                fontSize: '26px', fontStyle: 'italic',
                paddingBottom: '10px', marginBottom: '1.5rem',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={14}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: t.bodyText, fontFamily: 'var(--font-lora)',
                fontSize: '17px', lineHeight: '2.1',
                resize: 'none', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{
                  fontSize: '12px', padding: '7px 18px', borderRadius: '4px',
                  background: t.accent, color: t.bg, border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-lora)',
                  opacity: saving ? 0.7 : 1, letterSpacing: '0.03em',
                }}
              >
                {saving ? 'saving...' : 'save changes'}
              </button>
              <button
                onClick={() => { setEditTitle(entry.title || ''); setEditBody(entry.body || ''); setIsEditing(false) }}
                style={{
                  fontSize: '12px', padding: '7px 18px', borderRadius: '4px',
                  background: 'none', color: t.textMuted,
                  border: `1px solid ${t.cardBorder}`,
                  cursor: 'pointer', fontFamily: 'var(--font-lora)',
                }}
              >
                cancel
              </button>
            </div>
          </>
        ) : (
          /* Read mode */
          <>
            {entry.title && (
              <h1 style={{
                fontFamily: 'var(--font-lora)',
                color: t.inputText,
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '2rem',
                lineHeight: '1.25',
                letterSpacing: '-0.01em',
              }}>
                {entry.title}
              </h1>
            )}

            {/* Pen stroke divider */}
            <div style={{
              width: '32px', height: '1px',
              background: t.cardBorder, marginBottom: '2rem',
            }} />

            <div style={{
              fontFamily: 'var(--font-lora)',
              color: t.bodyText,
              fontSize: '18px',
              lineHeight: '2.1',
              whiteSpace: 'pre-wrap',
            }}>
              {entry.body}
            </div>
          </>
        )}

        {/* Bottom actions */}
        {!isEditing && (
          <div style={{
            marginTop: '4rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${t.entryBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>

            {/* Share */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{
                  fontSize: '11px', color: t.textMuted,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  marginBottom: '2px', fontFamily: 'var(--font-lora)',
                }}>
                  {entry.is_public ? '✦ shared this week' : 'share this week'}
                </p>
                <p style={{
                  fontSize: '11px', color: t.textDim,
                  fontFamily: 'var(--font-lora)', fontStyle: 'italic',
                }}>
                  {entry.is_public
                    ? 'visible on the community feed anonymously'
                    : 'one entry per week · anonymous · no comments'}
                </p>
              </div>
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                style={{
                  fontSize: '11px', padding: '6px 14px',
                  borderRadius: '3px',
                  background: entry.is_public ? `${t.accent}20` : 'transparent',
                  color: entry.is_public ? t.accent : t.textDim,
                  border: `1px solid ${entry.is_public ? t.accent : t.entryBorder}`,
                  cursor: 'pointer', letterSpacing: '0.05em',
                  fontFamily: 'var(--font-lora)',
                  transition: 'all 0.15s ease',
                  marginLeft: '16px', whiteSpace: 'nowrap',
                }}
              >
                {sharing ? '...' : entry.is_public ? 'unshare' : 'share'}
              </button>
            </div>

            {/* Edit and delete */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  fontSize: '11px', color: t.textDim, background: 'none',
                  border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-lora)',
                  transition: 'color 0.15s ease', padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >
                ✎ edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontSize: '11px', color: t.textDim, background: 'none',
                  border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-lora)',
                  transition: 'color 0.15s ease', padding: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c05050'}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
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