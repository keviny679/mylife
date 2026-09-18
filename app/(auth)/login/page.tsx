'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthShell, { AuthField, AuthSubmit } from '@/components/AuthShell'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/journal')
    }
    setLoading(false)
  }

  return (
    <AuthShell
      eyebrow="Personal journal"
      title="Welcome back"
      subtitle="Your pages are waiting for you."
      footer={<>New here? <Link href="/signup" style={{ color: 'inherit', fontWeight: '600' }}>Create your journal</Link></>}
    >
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {message && (
          <p role="alert" style={{
            color: '#a74747', fontFamily: 'var(--font-lora)',
            fontSize: '11px', lineHeight: '1.5', textAlign: 'center',
          }}>
            {message}
          </p>
        )}

        <AuthSubmit loading={loading}>{loading ? 'Opening your journal…' : 'Open journal'}</AuthSubmit>
      </form>
    </AuthShell>
  )
}
