'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

export default function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [backHover, setBackHover] = useState(false)
  const [deleteHover, setDeleteHover] = useState(false)
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
        .from('entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

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

  function handleCancelEdit() {
    setEditTitle(entry.title || '')
    setEditBody(entry.body || '')
    setIsEditing(false)
  }

const BLOCKED_TERMS = [
  'nigger', 'nigga', 'faggot', 'chink', 'spic', 'kike',
  'tranny', 'retard', 'cunt', 'whore', 'rape',
]

function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_TERMS.some(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'i')
    return regex.test(lower)
  })
}

async function handleToggleShare() {
  if (entry.is_public) {
    // Unshare — no checks needed
    if (!confirm('Remove this entry from the community feed?')) return
    setSharing(true)
    const { error } = await supabase
      .from('entries')
      .update({ is_public: false, shared_at: null })
      .eq('id', entry.id)
    if (!error) setEntry({ ...entry, is_public: false, shared_at: null })
    setSharing(false)
    return
  }

  // Share confirmation
  if (!confirm('Share this entry anonymously on the community feed this week? It will be visible to everyone and disappear after 7 days.')) return

  // Content check
  const fullText = `${entry.title || ''} ${entry.body}`
  if (containsBlockedContent(fullText)) {
    alert('This entry contains content that isn\'t allowed on the community feed. Please review it before sharing.')
    return
  }

  setSharing(true)

  // One entry per week check
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: recentShared } = await supabase
    .from('entries')
    .select('id')
    .eq('user_id', entry.user_id)
    .eq('is_public', true)
    .gte('shared_at', sevenDaysAgo)

  if (recentShared && recentShared.length > 0) {
    alert("You've already shared an entry this week. Unshare your current entry first.")
    setSharing(false)
    return
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('entries')
    .update({ is_public: true, shared_at: now })
    .eq('id', entry.id)
  if (!error) setEntry({ ...entry, is_public: true, shared_at: now })
  setSharing(false)
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)' }}>Loading...</p>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: t.bg }}>
        <p style={{ color: t.textFaint, fontFamily: 'var(--font-lora)', marginBottom: '1rem' }}>Entry not found.</p>
        <Link href="/journal" style={{ color: t.accent, fontFamily: 'var(--font-lora)' }}>Back to journal</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: t.bg }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow2} 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', width: '600px', height: '600px', transform: 'translate(-50%, -60%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">

        <Link
          href="/journal"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', color: backHover ? t.accent : t.textDim,
            textDecoration: 'none', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '1.5rem',
            transition: 'color 0.2s ease'
          }}
        >
          ← journal
        </Link>

        <p style={{ fontSize: '12px', color: t.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {entry.mood && ` · ${entry.mood}`}
        </p>

        {isEditing ? (
          <>
            <input
              type="text"
              placeholder="Title (optional)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${t.cardBorder}`, color: t.inputText, fontFamily: 'var(--font-lora)', fontSize: '28px', paddingBottom: '12px', marginBottom: '24px', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ width: '40px', height: '1px', background: t.cardBorder, marginBottom: '2rem' }} />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={12}
              style={{ width: '100%', background: 'transparent', border: 'none', color: t.bodyText, fontFamily: 'var(--font-lora)', fontSize: '19px', lineHeight: '2.1', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button onClick={handleSaveEdit} disabled={saving} style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', background: t.accentStrong, color: t.bg, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-lora)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button onClick={handleCancelEdit} style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', background: 'none', color: t.textMuted, border: `1px solid ${t.cardBorder}`, cursor: 'pointer', fontFamily: 'var(--font-lora)' }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {entry.title && (
              <h1 style={{ fontFamily: 'var(--font-lora)', color: t.accent, fontSize: '36px', fontWeight: '500', marginBottom: '2.5rem', lineHeight: '1.3' }}>
                {entry.title}
              </h1>
            )}
            <div style={{ width: '40px', height: '1px', background: t.cardBorder, marginBottom: '2.5rem' }} />
            <div style={{ fontFamily: 'var(--font-lora)', color: t.inputText, fontSize: '19px', lineHeight: '2.1', whiteSpace: 'pre-wrap' }}>
              {entry.body}
            </div>
          </>
        )}

        {/* Bottom actions */}
        <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: `1px solid ${t.entryBorder}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Share section */}
          {!isEditing && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {entry.is_public ? '✦ shared this week' : 'share this week'}
                </p>
                <p style={{ fontSize: '11px', color: t.textDim, fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
                  {entry.is_public
                    ? 'visible on the community feed anonymously'
                    : 'one entry per week, anonymous, no comments'}
                </p>
              </div>
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                style={{
                  fontSize: '12px',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  background: entry.is_public ? t.entryBg : 'transparent',
                  color: entry.is_public ? t.accent : t.textDim,
                  border: entry.is_public ? `1px solid ${t.accent}` : `1px solid ${t.entryBorder}`,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  marginLeft: '16px'
                }}
              >
                {sharing ? '...' : entry.is_public ? 'unshare' : 'share'}
              </button>
            </div>
          )}

          {/* Edit and delete */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ fontSize: '12px', color: t.textDim, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s ease', padding: '0' }}
                onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = t.textDim}
              >
                ✎ edit entry
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              onMouseEnter={() => setDeleteHover(true)}
              onMouseLeave={() => setDeleteHover(false)}
              style={{ fontSize: '12px', color: deleteHover ? '#e05555' : t.textDim, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s ease', padding: '0', marginLeft: 'auto' }}
            >
              {deleting ? 'deleting...' : '× delete this entry'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}