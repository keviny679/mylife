'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignUp() {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name }
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email to confirm your account!')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: '#140d05' }}>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,20,0.07) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,140,30,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md px-6">
        <h1 style={{ fontFamily: 'var(--font-lora)', color: '#e8956d', fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>MyLife</h1>
        <p style={{ color: '#5c3d22', fontSize: '14px', textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}>Your private space to reflect.</p>

        <div className="rounded-xl p-8" style={{ background: '#1c1007', border: '1px solid #3b2410' }}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', background: '#140d05', border: '1px solid #3b2410', borderRadius: '8px', color: '#f0d4b0', fontFamily: 'var(--font-lora)', fontSize: '15px', padding: '12px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', background: '#140d05', border: '1px solid #3b2410', borderRadius: '8px', color: '#f0d4b0', fontFamily: 'var(--font-lora)', fontSize: '15px', padding: '12px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', background: '#140d05', border: '1px solid #3b2410', borderRadius: '8px', color: '#f0d4b0', fontFamily: 'var(--font-lora)', fontSize: '15px', padding: '12px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSignUp}
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#c45e2a', color: '#140d05', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '15px', fontFamily: 'var(--font-lora)' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {message && (
            <p style={{ color: '#e8956d', fontSize: '13px', textAlign: 'center', marginTop: '1rem' }}>{message}</p>
          )}
        </div>

        <p style={{ color: '#3b2410', fontSize: '13px', textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#5c3d22' }}>Log in</a>
        </p>
      </div>
    </main>
  )
}