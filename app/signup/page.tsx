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
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg text-white placeholder-gray-500"
        />
        
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
          onClick={handleSignUp}
          disabled={loading}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {message && (
          <p className="mt-4 text-center text-gray-400">{message}</p>
        )}
      </div>
    </main>
  )
}