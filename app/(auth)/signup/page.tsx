'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Music2, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (err) setError(err.message)
    else setDone(true)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#22c55e' }} />
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <motion.div whileHover={{ scale:1.05, rotate:5 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', boxShadow: '0 0 40px var(--accent-glow-strong)' }}>
            <Music2 size={28} color="white" />
          </motion.div>
          <h1 className="text-3xl font-black">Wavify</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Stream your world</p>
        </div>

        <div className="glass rounded-2xl p-7">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Check your email!</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We sent a link to <strong>{email}</strong>. Click it to activate your account.
                </p>
              </div>
              <Link href="/login" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-5">Create account</h2>
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium mb-5 transition-all hover:bg-white/5 disabled:opacity-60"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Sign up with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
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
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-6 h-6">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={confirm}
                      onChange={e => setConfirm(e.target.value)} required
                      className="input-dark w-full pl-9 pr-4 py-3 rounded-xl text-sm" />
                  </div>
                </div>
                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-1">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
        {!done && (
          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}
