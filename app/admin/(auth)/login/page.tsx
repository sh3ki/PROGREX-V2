'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('progrex_admin_email')
      if (!savedEmail) return
      setEmail(savedEmail)
      setRememberMe(true)
    } catch {
      // ignore storage read issues
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      try {
        if (rememberMe) localStorage.setItem('progrex_admin_email', email)
        else localStorage.removeItem('progrex_admin_email')
      } catch {
        // ignore storage write issues
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#03030F] text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-nebula-700/30 bg-white/3 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-nebula-300">Admin Access</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Login</h1>
        <p className="mt-1 text-sm text-slate-400">No signup is available for this panel.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-nebula-700/40 bg-[#07071a] px-3 py-2 text-sm outline-none focus:border-nebula-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-nebula-700/40 bg-[#07071a] px-3 py-2 text-sm outline-none focus:border-nebula-400"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-nebula-700/40 bg-[#07071a]"
            />
            Remember me
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-linear-to-r from-nebula-700 to-aurora-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
