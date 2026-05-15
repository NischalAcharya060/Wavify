'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { AuthPage, Spinner, EmailIcon } from '@/components/AuthLayout'

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="27" stroke="rgba(134,239,172,0.25)" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="20" fill="rgba(34,197,94,0.1)" stroke="rgba(134,239,172,0.4)" strokeWidth="1"/>
      <path d="M18 28l7 7 13-13" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/home`,
    })
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <AuthPage title="Reset Password" subtitle="We'll send you a link to reset your password">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <CheckCircle />
            <h2 style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 26,
              color: '#f0f0ff',
              margin: '20px 0 10px',
            }}>
              Check your email
            </h2>
            <p style={{
              fontSize: 14,
              color: 'rgba(160,150,200,0.7)',
              marginBottom: 24,
            }}>
              Reset link sent to <strong style={{ color: '#c4a7ff' }}>{email}</strong>
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeftIcon /> Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleReset}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>
              <label style={{
                display: 'block',
                fontSize: 12.5,
                color: 'rgba(190,175,230,0.7)',
                marginBottom: 8,
                fontWeight: 500,
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  color: focusedField ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.35)',
                  transition: 'color 0.2s',
                }}>
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  placeholder="you@example.com"
                  className="auth-input"
                  style={{ padding: '0 16px 0 44px' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? <Spinner /> : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: 'rgba(167,139,250,0.6)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeftIcon /> Back to login
              </Link>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthPage>
  )
}