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

  // EDIT MODE STATE
  // isEditing toggles between read view and edit view
  // editTitle and editBody are controlled inputs seeded from entry data
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const { t } = useTheme()

  useEffect(() => {
    async function getEntry() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

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
        // Seed edit fields with existing content
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

  // SAVE EDIT
  // Uses Supabase .update() — same pattern as .insert() but modifies existing row
  // On success: updates local entry state so UI reflects changes without refetching
  async function handleSaveEdit() {
    if (!editBody.trim()) return
    setSaving(true)

    const { error } = await supabase
      .from('entries')
      .update({
        title: editTitle.trim() || null,
        body: editBody.trim(),
      })
      .eq('id', entry.id)

    if (!error) {
      setEntry({ ...entry, title: editTitle.trim() || null, body: editBody.trim() })
      setIsEditing(false)
    }

    setSaving(false)
  }

  function handleCancelEdit() {
    // Reset edit fields back to original entry content
    setEditTitle(entry.title || '')
    setEditBody(entry.body || '')
    setIsEditing(false)
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none" style={{ background: `radial-gradient(circle, ${t.glow3} 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href="/journal"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: backHover ? t.accent : t.textDim,
            textDecoration: 'none',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            transition: 'color 0.2s ease'
          }}
        >
          ← journal
        </Link>

        {/* Date and mood — always visible regardless of edit mode */}
        <p style={{
          fontSize: '12px',
          color: t.textDim,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {entry.mood && ` · ${entry.mood}`}
        </p>

        {/*
          EDIT / READ MODE TOGGLE
          isEditing = true  → show editable inputs
          isEditing = false → show read-only text
          Edit button sits next to the date, subtle and out of the way
          To improve: add mood editing, add keyboard shortcut (Cmd+E to edit)
        */}
        {isEditing ? (
          <>
            <input
              type="text"
              placeholder="Title (optional)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${t.cardBorder}`,
                color: t.inputText,
                fontFamily: 'var(--font-lora)',
                fontSize: '28px',
                paddingBottom: '12px',
                marginBottom: '24px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ width: '40px', height: '1px', background: t.cardBorder, marginBottom: '2rem' }} />

            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: t.bodyText,
                fontFamily: 'var(--font-lora)',
                fontSize: '19px',
                lineHeight: '2.1',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{
                  fontSize: '13px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: t.accentStrong,
                  color: t.bg,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-lora)',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  fontSize: '13px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'none',
                  color: t.textMuted,
                  border: `1px solid ${t.cardBorder}`,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-lora)',
                  transition: 'color 0.2s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {entry.title && (
              <h1 style={{
                fontFamily: 'var(--font-lora)',
                color: t.accent,
                fontSize: '36px',
                fontWeight: '500',
                marginBottom: '2.5rem',
                lineHeight: '1.3'
              }}>
                {entry.title}
              </h1>
            )}

            <div style={{ width: '40px', height: '1px', background: t.cardBorder, marginBottom: '2.5rem' }} />

            <div style={{
              fontFamily: 'var(--font-lora)',
              color: t.bodyText,
              fontSize: '19px',
              lineHeight: '2.1',
              whiteSpace: 'pre-wrap'
            }}>
              {entry.body}
            </div>
          </>
        )}

        {/* Bottom actions — edit and delete */}
        <div style={{
          marginTop: '5rem',
          paddingTop: '2rem',
          borderTop: `1px solid ${t.entryBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                fontSize: '12px',
                color: t.textDim,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                padding: '0'
              }}
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
            style={{
              fontSize: '12px',
              color: deleteHover ? '#e05555' : t.textDim,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.2s ease',
              padding: '0',
              marginLeft: 'auto'
            }}
          >
            {deleting ? 'deleting...' : '× delete this entry'}
          </button>
        </div>

      </div>
    </main>
  )
}