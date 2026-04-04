'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Music2, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (err) setError(err.message); else setDone(true)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } })
  }

  const inputStyle = { width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 10 }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-15" style={{ width: 350, height: 350, top: '15%', right: '-8%', background: 'var(--accent)' }} />
        <div className="absolute rounded-full blur-3xl opacity-10" style={{ width: 280, height: 280, bottom: '15%', left: '-6%', background: '#22c55e' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 380, position: 'relative' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div whileHover={{ scale: 1.06 }} style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--accent-glow-strong)' }}>
            <Music2 size={26} color="white" />
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>Wavify</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Stream your world</p>
        </div>

        <div style={{ background: 'rgba(22,22,38,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 28px 24px' }}>
          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
              <CheckCircle2 size={52} style={{ color: 'var(--success)' }} />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  We sent a confirmation link to <strong>{email}</strong>
                </p>
              </div>
              <Link href="/login" className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'Syne,sans-serif' }}>Create account</h2>
              <button onClick={handleGoogle} disabled={googleLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '11px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', marginBottom: 18, opacity: googleLoading ? 0.6 : 1, fontFamily: 'DM Sans,sans-serif' }}>
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Sign up with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or email</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Email', type: 'email', val: email, set: setEmail, placeholder: 'you@example.com', Icon: Mail },
                  { label: 'Password', type: showPass ? 'text' : 'password', val: password, set: setPassword, placeholder: '••••••••', Icon: Lock, eye: true },
                  { label: 'Confirm Password', type: showPass ? 'text' : 'password', val: confirm, set: setConfirm, placeholder: '••••••••', Icon: Lock },
                ].map(({ label, type, val, set, placeholder, Icon, eye }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input type={type} placeholder={placeholder} value={val} onChange={e => set(e.target.value)} required className="input-dark" style={{ ...inputStyle, paddingRight: eye ? 40 : 14 }} />
                      {eye && <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                    </div>
                  </div>
                ))}
                {error && <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(244,63,94,0.08)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.18)' }}>{error}</div>}
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
        {!done && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}
