'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

function WavifyLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="white" fillOpacity="0.12"/>
      <path d="M5 20 Q8 10 11 20 Q14 30 17 20 Q20 10 23 20 Q26 30 27 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function CheckBadge() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="25" stroke="rgba(134,239,172,0.3)" strokeWidth="1.5"/>
      <circle cx="26" cy="26" r="19" fill="rgba(34,197,94,0.12)" stroke="rgba(134,239,172,0.4)" strokeWidth="1"/>
      <path d="M17 26l6 6 12-12" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const particles = [
  { x: '6%',  y: '20%', size: 10, delay: 0,   dur: 9  },
  { x: '90%', y: '18%', size: 7,  delay: 2,   dur: 11 },
  { x: '4%',  y: '70%', size: 12, delay: 3.5, dur: 8  },
  { x: '93%', y: '65%', size: 8,  delay: 1,   dur: 10 },
  { x: '18%', y: '88%', size: 6,  delay: 4,   dur: 9  },
  { x: '78%', y: '90%', size: 9,  delay: 2.5, dur: 7  },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

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

  const fields = [
    { key: 'email',   label: 'Email address',    type: 'email',    val: email,    set: setEmail,    placeholder: 'you@example.com', icon: 'email' },
    { key: 'pass',    label: 'Password',          type: showPass ? 'text' : 'password', val: password, set: setPassword, placeholder: '••••••••••', icon: 'lock', eye: true },
    { key: 'confirm', label: 'Confirm password',  type: showPass ? 'text' : 'password', val: confirm,  set: setConfirm,  placeholder: '••••••••••', icon: 'lock' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatUp { 0%{transform:translateY(0) rotate(0);opacity:0} 10%{opacity:0.35} 90%{opacity:0.1} 100%{transform:translateY(-110px) rotate(18deg);opacity:0} }
        @keyframes subtlePulse { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:0.75;transform:scale(1.04)} }
        .signup-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #f0f0f8;
          font-family: 'Geist', sans-serif;
          font-size: 14px;
          font-weight: 400;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .signup-input::placeholder { color: rgba(160,160,200,0.35); }
        .signup-input:focus {
          border-color: rgba(167,139,250,0.55);
          background: rgba(167,139,250,0.05);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12), 0 1px 2px rgba(0,0,0,0.2);
        }
        .social-btn-s {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 12px 14px;
          font-family: 'Geist', sans-serif; font-size: 13.5px; font-weight: 500;
          color: rgba(230,230,255,0.85); cursor: pointer;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          transition: all 0.18s; position: relative; overflow: hidden;
        }
        .social-btn-s:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.07); }
        .social-btn-s:active { transform: scale(0.985); }
        .submit-btn-s {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #5b21b6 100%);
          color: white; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 0.01em; border: none; border-radius: 12px; cursor: pointer;
          position: relative; overflow: hidden; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .submit-btn-s::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%); border-radius: 12px; }
        .submit-btn-s:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(109,40,217,0.55), 0 1px 0 rgba(255,255,255,0.12) inset; }
        .submit-btn-s:active { transform: translateY(0); }
        .submit-btn-s:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .particle { position: absolute; pointer-events: none; animation: floatUp linear infinite; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#08080f', position: 'relative', overflow: 'hidden', fontFamily: 'Geist, sans-serif' }}>

        {/* BG */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 80% 10%, rgba(88,28,235,0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(124,58,237,0.1) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)', bottom: '-12%', left: '-8%', pointerEvents: 'none', animation: 'subtlePulse 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', top: '-8%', right: '-5%', pointerEvents: 'none', animation: 'subtlePulse 9s ease-in-out infinite 3s' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5) 30%, rgba(196,130,255,0.75) 50%, rgba(139,92,246,0.5) 70%, transparent)', pointerEvents: 'none' }} />

        {/* Particles */}
        {mounted && particles.map((p, i) => (
          <div key={i} className="particle" style={{ left: p.x, top: p.y, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        ))}

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}
        >
          <div style={{ position: 'absolute', inset: -1, borderRadius: 24, background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.08) 40%, rgba(196,130,255,0.28) 100%)', zIndex: -1 }} />
          <div style={{ background: 'rgba(12,10,22,0.9)', backdropFilter: 'blur(32px) saturate(1.4)', WebkitBackdropFilter: 'blur(32px) saturate(1.4)', borderRadius: 23, border: '1px solid rgba(139,92,246,0.18)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(88,28,235,0.07) 100%)', borderBottom: '1px solid rgba(139,92,246,0.1)', padding: '26px 32px 22px' }}>
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(109,40,217,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset', flexShrink: 0 }}>
                  <WavifyLogo />
                </div>
                <div>
                  <p style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: '#f0f0ff', lineHeight: 1 }}>Wavify</p>
                  <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(160,145,200,0.65)', marginTop: 2, letterSpacing: '0.03em' }}>Stream your world</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 400, color: '#f5f0ff', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 4 }}>
                  Join Wavify
                </h1>
                <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'rgba(160,145,210,0.6)', letterSpacing: '0.01em' }}>
                  Your music, everywhere
                </p>
              </motion.div>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 32px 30px' }}>
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="done"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0 16px' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}>
                      <CheckBadge />
                    </motion.div>
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 24, color: '#f0f0ff', marginBottom: 8 }}>
                        Check your inbox
                      </h2>
                      <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'rgba(160,150,200,0.7)', lineHeight: 1.6 }}>
                        We sent a confirmation link to<br/>
                        <strong style={{ color: 'rgba(196,167,255,0.9)' }}>{email}</strong>
                      </p>
                    </div>
                    <Link href="/login"
                      className="submit-btn-s"
                      style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', marginTop: 4 }}>
                      Back to Sign In
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Google */}
                    <motion.button
                      onClick={handleGoogle} disabled={googleLoading}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28, duration: 0.35 }}
                      className="social-btn-s"
                      style={{ marginBottom: 18, opacity: googleLoading ? 0.6 : 1 }}
                    >
                      {googleLoading ? <Spinner /> : <GoogleIcon />}
                      Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                      <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(140,130,180,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>or with email</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </motion.div>

                    {/* Fields */}
                    <motion.form onSubmit={handleSignup}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.36, duration: 0.35 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {fields.map(({ key, label, type, val, set, placeholder, icon, eye }) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, color: 'rgba(190,175,230,0.7)', marginBottom: 6, letterSpacing: '0.02em' }}>
                            {label}
                          </label>
                          <div style={{ position: 'relative' }}>
                            {/* Icon */}
                            {icon === 'email' ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focusedField === key ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'stroke 0.2s' }}>
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            ) : (
                              <svg width="13" height="14" viewBox="0 0 24 24" fill="none" stroke={focusedField === key ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'stroke 0.2s' }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            )}
                            <input
                              type={type} placeholder={placeholder} value={val}
                              onChange={e => set(e.target.value)}
                              onFocus={() => setFocusedField(key)}
                              onBlur={() => setFocusedField(null)}
                              required
                              className="signup-input"
                              style={{ padding: `11px ${eye ? 44 : 14}px 11px 38px` }}
                            />
                            {eye && (
                              <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(140,130,180,0.45)', display: 'flex', padding: 4, transition: 'color 0.15s', borderRadius: 6 }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(190,175,230,0.75)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(140,130,180,0.45)')}>
                                <EyeIcon open={showPass} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 10, fontSize: 12.5, background: 'rgba(244,63,94,0.08)', color: 'rgba(252,165,165,0.95)', border: '1px solid rgba(244,63,94,0.18)', fontFamily: 'Geist, sans-serif', lineHeight: 1.4 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              {error}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button type="submit" disabled={loading || googleLoading} className="submit-btn-s"
                        style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, position: 'relative' }}>
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {loading && <Spinner />}
                          {loading ? 'Creating account…' : 'Create Account'}
                        </span>
                      </button>
                    </motion.form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: 'rgba(140,130,180,0.5)' }}>
                      Already have an account?{' '}
                      <Link href="/login"
                        style={{ color: 'rgba(196,167,255,0.85)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(196,167,255,0.25)', paddingBottom: 1 }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(220,200,255,1)' }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(196,167,255,0.85)' }}>
                        Sign in
                      </Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
