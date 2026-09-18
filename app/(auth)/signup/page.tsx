'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthShell, { AuthField, AuthSubmit } from '@/components/AuthShell'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setSuccess(true)
      setMessage('Check your email to confirm your account, then return here to log in.')
    }
    setLoading(false)
  }

  return (
    <AuthShell
      eyebrow="A place for your days"
      title="Begin your journal"
      subtitle="Private by default. Written in your own voice."
      footer={<>Already have a journal? <Link href="/login" style={{ color: 'inherit', fontWeight: '600' }}>Log in</Link></>}
    >
      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AuthField
          label="Name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={80}
          required
        />
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
          autoComplete="new-password"
          minLength={6}
          required
        />

        {message && (
          <p role={success ? 'status' : 'alert'} style={{
            color: success ? '#477c68' : '#a74747',
            fontFamily: 'var(--font-lora)', fontSize: '11px',
            lineHeight: '1.5', textAlign: 'center',
          }}>
            {message}
          </p>
        )}

        <AuthSubmit loading={loading}>{loading ? 'Creating your journal…' : 'Create journal'}</AuthSubmit>
      </form>
    </AuthShell>
  )
}
