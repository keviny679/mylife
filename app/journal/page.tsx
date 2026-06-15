'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const moods = ['😌 calm', '🌧 reflective', '😊 grateful', '😔 hard day', '⚡ energized']

export default function Journal() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)
  const [rainPlaying, setRainPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

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

    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3')
    audioRef.current.loop = true
  }, [])

  function toggleRain() {
    if (!audioRef.current) return
    if (rainPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setRainPlaying(!rainPlaying)
  }

  async function handleSaveEntry() {
    if (!body.trim()) return
    setSaving(true)

    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: mood || null,
    })

    console.log('save error:', error)
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

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#140d05' }}>
        <p style={{ color: '#5c3d22', fontFamily: 'var(--font-lora)' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: '#140d05' }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,20,0.07) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,140,30,0.05) 0%, transparent 70%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(220,80,10,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-lora)', color: '#e8956d', fontSize: '24px' }}>MyLife</h1>
          <button onClick={handleSignOut} style={{ color: '#5c3d22', fontSize: '13px' }}>sign out</button>
        </div>

        <p style={{ color: '#5c3d22', fontSize: '13px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="rounded-xl p-6 mb-6" style={{ background: '#1c1007', border: '1px solid #3b2410' }}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3b2410', color: '#f0d4b0', fontFamily: 'var(--font-lora)', fontSize: '20px', paddingBottom: '12px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="How did today go..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#c4a882', fontFamily: 'var(--font-lora)', fontSize: '16px', lineHeight: '1.9', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          />
          <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid #3b2410' }}>
            <div className="flex gap-2 flex-wrap">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? '' : m)}
                  style={{
                    fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
                    background: mood === m ? '#3b2410' : '#140d05',
                    color: mood === m ? '#e8956d' : '#5c3d22',
                    border: mood === m ? '1px solid #e8956d' : '1px solid #2a1a0a',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveEntry}
              disabled={saving}
              style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', background: '#c45e2a', color: '#140d05', border: 'none', cursor: 'pointer', fontWeight: '500', marginLeft: '12px', whiteSpace: 'nowrap' }}
            >
              {saving ? 'Saving...' : 'Save entry'}
            </button>
          </div>
        </div>

        <button
          onClick={toggleRain}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: rainPlaying ? '#e8956d' : '#4a2e12', background: '#180e06', border: '1px solid #2a1a0a', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', margin: '0 auto 1.5rem' }}
        >
          🌧 {rainPlaying ? 'rain on' : 'rain sounds'}
        </button>

        <p style={{ fontSize: '12px', color: '#3b2410', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Previous entries</p>

        {entries.length === 0 ? (
          <p style={{ color: '#4a2e12', textAlign: 'center', marginTop: '4rem', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>
            No entries yet. Start writing your first one.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl p-6" style={{ background: '#180e06', border: '1px solid #2a1a0a' }}>
                <p style={{ fontSize: '12px', color: '#4a2e12', marginBottom: '6px' }}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {entry.mood && ` · ${entry.mood}`}
                </p>
                {entry.title && (
                  <p style={{ fontFamily: 'var(--font-lora)', color: '#e8956d', fontSize: '17px', marginBottom: '6px', fontWeight: '500' }}>{entry.title}</p>
                )}
                <p style={{ fontFamily: 'var(--font-lora)', color: '#6b4c2a', fontSize: '15px', lineHeight: '1.7' }}>{entry.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}