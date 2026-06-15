'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/journal')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl">
        <h1 className="text-2xl font-bold mb-6">Welcome back</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg text-white placeholder-gray-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-gray-800 rounded-lg text-white placeholder-gray-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {message && (
          <p className="mt-4 text-center text-red-400">{message}</p>
        )}
      </div>
    </main>
  )
}