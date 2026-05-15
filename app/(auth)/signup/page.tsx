'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { AuthPage, Spinner, GoogleIcon, EmailIcon, LockIcon, Divider, InputField, AuthLink } from '@/components/AuthLayout'

function CheckBadge() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="27" stroke="rgba(134,239,172,0.25)" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="20" fill="rgba(34,197,94,0.1)" stroke="rgba(134,239,172,0.4)" strokeWidth="1"/>
      <path d="M18 28l7 7 13-13" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
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
    <AuthPage title="Join Wavify" subtitle="Start your musical journey today">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <CheckBadge />
            <h2 style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 26,
              color: '#f0f0ff',
              margin: '20px 0 10px',
            }}>
              Check your inbox
            </h2>
            <p style={{
              fontSize: 14,
              color: 'rgba(160,150,200,0.7)',
              marginBottom: 24,
            }}>
              Verification link sent to <strong style={{ color: '#c4a7ff' }}>{email}</strong>
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                padding: '14px 28px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                border: 'none',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(109,40,217,0.35)',
              }}
            >
              Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form">
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="social-btn"
            >
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </button>

            <Divider />

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<EmailIcon />}
                focused={focusedField === 'email'}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />

              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                icon={<LockIcon />}
                showToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                focused={focusedField === 'password'}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />

              <InputField
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm your password"
                icon={<LockIcon />}
                focused={focusedField === 'confirm'}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
              />

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? <Spinner /> : 'Create Account'}
              </button>
            </form>

            <AuthLink text="Already have an account?" linkText="Sign in" href="/login" />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPage>
  )
}