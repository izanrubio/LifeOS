'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      router.push('/today')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5L2 8v9l8 4.5 8-4.5V8l-8-4.5z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">LifeOS</span>
        </div>
        <button className="text-white text-sm hover:text-gray-300 transition-colors">
          Join the Waitlist
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">LifeOS</h1>
            <p className="text-gray-400 text-sm">Daily log</p>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-gray-400 text-sm">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-black transition-colors"
              >
                {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <span className="text-gray-400 text-sm">
                {isLogin ? 'New here? ' : 'Already have an account? '}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
                className="text-white text-sm hover:text-gray-300 transition-colors"
              >
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 flex items-center justify-center gap-6">
        <a href="#" className="text-gray-500 text-xs hover:text-gray-400 transition-colors uppercase tracking-wide">
          Privacy
        </a>
        <a href="#" className="text-gray-500 text-xs hover:text-gray-400 transition-colors uppercase tracking-wide">
          Terms
        </a>
        <a href="#" className="text-gray-500 text-xs hover:text-gray-400 transition-colors uppercase tracking-wide">
          Manifest
        </a>
      </footer>
    </div>
  )
}
