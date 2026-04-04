'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Music2, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.3-164-39.3c-76 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 457.8 0 336.4 0 221.9c0-109 38-168 103-236.2C141.8 44.5 214.3.2 285 .2c70.7 0 117.9 41.4 177.1 41.4 56.7 0 115.2-43.4 191.4-43.4 30.4 0 107.9 2.6 168.1 80.6zm-219.1-89.7c-30.1 31.3-75.4 56.7-121.6 56.7-4.5 0-9.1-.4-13.6-.9-1.8-5.8-2.6-11.5-2.6-17.3 0-30.1 13.4-62.4 34.7-85.7 27.5-30.4 71.8-52.4 110.1-54.5 1.2 5.4 1.8 10.7 1.8 16.1 0 31-7.4 60.1-8.8 85.6z"/>
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
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
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/home` } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-base)' }}>
      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-20"
          style={{ width: 400, height: 400, top: '10%', left: '-10%', background: 'var(--accent)' }} />
        <div className="absolute rounded-full blur-3xl opacity-10"
          style={{ width: 300, height: 300, bottom: '10%', right: '-5%', background: 'var(--accent-2)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 380, position: 'relative' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            whileHover={{ scale: 1.06 }}
            style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
              background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px var(--accent-glow-strong)'
            }}>
            <Music2 size={26} color="white" />
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>Wavify</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Stream your world</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(22,22,38,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '28px 28px 24px'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'Syne,sans-serif' }}>
            Welcome back
          </h2>

          {/* Social buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
                transition: 'all 0.15s', opacity: socialLoading ? 0.6 : 1,
                fontFamily: 'DM Sans,sans-serif'
              }}>
              {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <button
              onClick={() => handleSocial('apple')}
              disabled={!!socialLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
                transition: 'all 0.15s', opacity: socialLoading ? 0.6 : 1,
                fontFamily: 'DM Sans,sans-serif'
              }}>
              {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin" /> : <AppleIcon />}
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="input-dark"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 10 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="input-dark"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 40, paddingTop: 11, paddingBottom: 11, borderRadius: 10 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(244,63,94,0.08)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.18)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '12px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
