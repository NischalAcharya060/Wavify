'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Music2, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.3-164-39.3c-76 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 457.8 0 336.4 0 221.9c0-109 38-168 103-236.2C141.8 44.5 214.3.2 285 .2c70.7 0 117.9 41.4 177.1 41.4 56.7 0 115.2-43.4 191.4-43.4 30.4 0 107.9 2.6 168.1 80.6zm-219.1-89.7c-30.1 31.3-75.4 56.7-121.6 56.7-4.5 0-9.1-.4-13.6-.9-1.8-5.8-2.6-11.5-2.6-17.3 0-30.1 13.4-62.4 34.7-85.7 27.5-30.4 71.8-52.4 110.1-54.5 1.2 5.4 1.8 10.7 1.8 16.1 0 31-7.4 60.1-8.8 85.6z"/>
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google'|'apple'|null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError(err.message)
    else router.push('/home')
  }

  const handleSocial = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/home` }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--accent-2)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', boxShadow: '0 0 40px var(--accent-glow-strong)' }}
          >
            <Music2 size={28} color="white" />
          </motion.div>
          <h1 className="text-3xl font-black">Wavify</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Stream your world</p>
        </div>

        <div className="glass rounded-2xl p-7">
          <h2 className="text-xl font-bold mb-5">Welcome back</h2>

          {/* Social buttons */}
          <div className="space-y-2.5 mb-5">
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-60"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}
            >
              {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <button
              onClick={() => handleSocial('apple')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-60"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}
            >
              {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin" /> : <AppleIcon />}
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="input-dark w-full pl-9 pr-4 py-3 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="input-dark w-full pl-9 pr-10 py-3 rounded-xl text-sm" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-6 h-6">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' }}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-1">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent)' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
