'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/home`,
    })
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .reset-input {
          width: 100%; height: 48px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #f0f0f8; font-size: 14px;
          border-radius: 12px; outline: none;
          transition: all 0.2s; box-sizing: border-box;
          padding: 0 16px 0 44px;
        }
        .reset-input:focus {
          border-color: rgba(167,139,250,0.55);
          background: rgba(167,139,250,0.05);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }
        .reset-btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white; font-weight: 600; border: none;
          border-radius: 12px; cursor: pointer;
          font-size: 14px; display: flex;
          align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4);
          transition: all 0.2s;
        }
        .reset-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(109,40,217,0.55); }
        .reset-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#08080f', position: 'relative', overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif', padding: 16,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 416, position: 'relative', zIndex: 10 }}
        >
          <div style={{
            background: 'rgba(12,10,22,0.9)', backdropFilter: 'blur(32px)',
            borderRadius: 23, border: '1px solid rgba(139,92,246,0.18)', overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(88,28,235,0.07) 100%)',
              borderBottom: '1px solid rgba(139,92,246,0.1)', padding: '26px 32px 22px',
            }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(167,139,250,0.7)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
                <ArrowLeft size={14} /> Back to login
              </Link>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#f5f0ff', lineHeight: 1.1 }}>
                Reset Password
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(160,145,210,0.6)', marginTop: 6 }}>
                We&apos;ll send you a link to reset your password
              </p>
            </div>

            <div style={{ padding: '22px 32px 30px' }}>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(52,211,153,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      <CheckCircle2 size={32} color="#34d399" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>Check your email</h2>
                    <p style={{ fontSize: 13, color: 'rgba(160,150,200,0.7)', marginBottom: 24 }}>
                      Reset link sent to <strong style={{ color: '#c4a7ff' }}>{email}</strong>
                    </p>
                    <Link href="/login" style={{
                      display: 'inline-flex', padding: '12px 24px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                    }}>
                      Back to Sign In
                    </Link>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(190,175,230,0.7)', marginBottom: 6 }}>Email address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(167,139,250,0.4)' }} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="reset-input"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    {error && (
                      <div style={{ padding: 10, borderRadius: 10, fontSize: 12, background: 'rgba(244,63,94,0.1)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.2)' }}>
                        {error}
                      </div>
                    )}
                    <button type="submit" disabled={loading} className="reset-btn">
                      {loading ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : 'Send Reset Link'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
