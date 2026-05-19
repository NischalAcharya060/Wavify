'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { AuthPage, Spinner, GoogleIcon, EmailIcon, LockIcon, Divider, InputField, AuthLink } from '@/components/AuthLayout'
import GoogleOneTap from '@/components/GoogleOneTap'
import OtpInput from '@/components/OtpInput'

function CheckBadge() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="27" stroke="rgba(134,239,172,0.25)" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="20" fill="rgba(34,197,94,0.1)" stroke="rgba(134,239,172,0.4)" strokeWidth="1"/>
      <path d="M18 28l7 7 13-13" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MailBadge() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="27" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="20" fill="rgba(124,58,237,0.1)" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
      <path d="M18 22l10 7 10-7M18 22h20v12H18z" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

const OTP_EXPIRY_SECONDS = 600

type Stage = 'form' | 'verify' | 'done'

function formatMs(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = useState<Stage>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [expiresIn, setExpiresIn] = useState(OTP_EXPIRY_SECONDS)
  const expiryStartRef = useRef<number | null>(null)
  const autoVerifyRef = useRef<string>('')

  useEffect(() => {
    if (stage !== 'verify') return
    const tick = () => {
      if (expiryStartRef.current != null) {
        const elapsed = Math.floor((Date.now() - expiryStartRef.current) / 1000)
        setExpiresIn(Math.max(0, OTP_EXPIRY_SECONDS - elapsed))
      }
      setResendCooldown(c => (c > 0 ? c - 1 : 0))
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [stage])

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
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    if (data.session) {
      router.push('/home')
      router.refresh()
      return
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists. Try signing in instead.')
      return
    }

    expiryStartRef.current = Date.now()
    setExpiresIn(OTP_EXPIRY_SECONDS)
    setResendCooldown(30)
    setCode('')
    setStage('verify')
  }

  const handleVerify = async (full?: string) => {
    const token = (full ?? code).trim()
    if (token.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    if (autoVerifyRef.current === token && verifying) return
    autoVerifyRef.current = token
    setError('')
    setVerifying(true)
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })
    setVerifying(false)
    if (err) {
      setError(err.message)
      setCode('')
      return
    }
    setStage('done')
    setTimeout(() => {
      router.push('/home')
      router.refresh()
    }, 900)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setResending(true)
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    if (err) {
      setError(err.message)
      return
    }
    expiryStartRef.current = Date.now()
    setExpiresIn(OTP_EXPIRY_SECONDS)
    setResendCooldown(30)
    setCode('')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
    })
    if (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  const expired = stage === 'verify' && expiresIn === 0

  return (
    <AuthPage title="Join Wavify" subtitle="Start your musical journey today">
      {stage === 'form' && <GoogleOneTap context="signup" />}
      <AnimatePresence mode="wait">
        {stage === 'done' ? (
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
              You&apos;re in!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(160,150,200,0.7)', marginBottom: 16 }}>
              Email verified · Taking you to your library…
            </p>
            <Spinner />
          </motion.div>
        ) : stage === 'verify' ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <MailBadge />
            </div>
            <h2 style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 24,
              color: '#f0f0ff',
              margin: '8px 0 6px',
            }}>
              Verify your email
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(160,150,200,0.7)', marginBottom: 22, lineHeight: 1.55 }}>
              We sent a 6-digit code to <strong style={{ color: '#c4a7ff' }}>{email}</strong>.<br />
              It expires in <strong style={{ color: expired ? '#fca5a5' : '#c4a7ff' }}>
                {formatMs(expiresIn)}
              </strong>.
            </p>

            <div style={{ marginBottom: 16 }}>
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={v => { if (!verifying && !expired) handleVerify(v) }}
                disabled={verifying || expired}
                autoFocus
                error={!!error}
              />
            </div>

            {error && <div className="auth-error" style={{ marginBottom: 14, textAlign: 'left' }}>{error}</div>}

            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={verifying || code.length !== 6 || expired}
              className="auth-btn"
            >
              {verifying ? <Spinner /> : expired ? 'Code expired' : 'Verify email'}
            </button>

            <div style={{ marginTop: 18, fontSize: 13, color: 'rgba(160,150,200,0.6)' }}>
              Didn&apos;t get it?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || (resendCooldown > 0 && !expired)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: resendCooldown > 0 && !expired ? 'not-allowed' : 'pointer',
                  color: resendCooldown > 0 && !expired ? 'rgba(160,150,200,0.4)' : '#c4a7ff',
                  fontWeight: 500, fontSize: 13,
                  textDecoration: resendCooldown > 0 && !expired ? 'none' : 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                {resending
                  ? 'Sending…'
                  : resendCooldown > 0 && !expired
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStage('form')
                setCode('')
                setError('')
              }}
              style={{
                marginTop: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(160,150,200,0.55)', fontSize: 12.5,
              }}
            >
              ← Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
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
