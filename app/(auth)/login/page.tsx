'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ── Icons ──────────────────────────────────────────────────────────────────
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

function AppleIcon() {
  return (
      <svg width="17" height="17" fill="#fff" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 640 640">
        <path d="M494.782 340.02c-.803-81.025 66.084-119.907 69.072-121.832-37.595-54.993-96.167-62.552-117.037-63.402-49.843-5.032-97.242 29.362-122.565 29.362-25.253 0-64.277-28.607-105.604-27.85-54.32.803-104.4 31.594-132.403 80.245C29.81 334.457 71.81 479.58 126.816 558.976c26.87 38.882 58.914 82.56 100.997 81 40.512-1.594 55.843-26.244 104.848-26.244 48.993 0 62.753 26.245 105.64 25.406 43.606-.803 71.232-39.638 97.925-78.65 30.887-45.12 43.548-88.75 44.316-90.994-.969-.437-85.029-32.634-85.879-129.439l.118-.035zM414.23 102.178C436.553 75.095 451.636 37.5 447.514-.024c-32.162 1.311-71.163 21.437-94.253 48.485-20.729 24.012-38.836 62.28-33.993 99.036 35.918 2.8 72.591-18.248 94.926-45.272l.036-.047z"/>
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

// ── Animated waveform background decoration ───────────────────────────────
function WaveDecoration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i}
          d={`M${-100 + i * 180} 300 Q${100 + i * 180} ${200 - i * 20} ${300 + i * 180} 300 Q${500 + i * 180} ${400 + i * 20} ${700 + i * 180} 300`}
          stroke="white" strokeWidth={1.5 - i * 0.2} fill="none"
          strokeOpacity={1 - i * 0.15}
        />
      ))}
    </svg>
  )
}

// ── Floating music note particles ──────────────────────────────────────────
const particles = [
  { x: '8%',  y: '15%', size: 11, delay: 0,    dur: 8  },
  { x: '88%', y: '22%', size: 8,  delay: 1.5,  dur: 10 },
  { x: '5%',  y: '65%', size: 13, delay: 3,    dur: 7  },
  { x: '92%', y: '70%', size: 9,  delay: 0.8,  dur: 9  },
  { x: '15%', y: '85%', size: 7,  delay: 2,    dur: 11 },
  { x: '80%', y: '88%', size: 10, delay: 4,    dur: 8  },
]

// ── Main component ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatUp {
          0%   { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-120px) rotate(20deg); opacity: 0; }
        }
        @keyframes meshShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.04); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-input {
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
        }
        .login-input::placeholder { color: rgba(160,160,200,0.35); }
        .login-input:focus {
          border-color: rgba(167,139,250,0.55);
          background: rgba(167,139,250,0.05);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12), 0 1px 2px rgba(0,0,0,0.2);
        }
        .social-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%;
          font-family: 'Geist', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(230,230,255,0.85);
          cursor: pointer;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          transition: all 0.18s;
          position: relative;
          overflow: hidden;
        }
        .social-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.18s;
        }
        .social-btn:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.07); }
        .social-btn:hover::before { opacity: 1; }
        .social-btn:active { transform: scale(0.985); }
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #5b21b6 100%);
          color: white;
          font-family: 'Geist', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .submit-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%);
          border-radius: 12px;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(109,40,217,0.55), 0 1px 0 rgba(255,255,255,0.12) inset; }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .particle { position: absolute; pointer-events: none; animation: floatUp linear infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: '#08080f',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Geist, sans-serif',
      }}>
        {/* ── Deep space gradient background ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(88,28,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(124,58,237,0.12) 0%, transparent 55%), radial-gradient(ellipse 100% 80% at 50% 50%, rgba(15,10,30,0.95) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── Noise texture overlay ── */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
          pointerEvents: 'none',
        }} />

        {/* ── Decorative glow orbs ── */}
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 70%)', top: '-15%', left: '-10%', pointerEvents: 'none', animation: 'subtlePulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', bottom: '-10%', right: '-8%', pointerEvents: 'none', animation: 'subtlePulse 8s ease-in-out infinite 2s' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,130,255,0.1) 0%, transparent 70%)', top: '40%', right: '15%', pointerEvents: 'none', animation: 'subtlePulse 10s ease-in-out infinite 4s' }} />

        {/* ── Wave lines decoration ── */}
        <WaveDecoration />

        {/* ── Floating particles ── */}
        {mounted && particles.map((p, i) => (
          <div key={i} className="particle" style={{ left: p.x, top: p.y, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        ))}

        {/* ── Thin top accent line ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6) 30%, rgba(196,130,255,0.8) 50%, rgba(139,92,246,0.6) 70%, transparent)', pointerEvents: 'none' }} />

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}
        >
          {/* Card glow border effect */}
          <div style={{
            position: 'absolute', inset: -1,
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.1) 40%, rgba(196,130,255,0.3) 100%)',
            zIndex: -1,
          }} />

          <div style={{
            background: 'rgba(12,10,22,0.88)',
            backdropFilter: 'blur(32px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
            borderRadius: 23,
            border: '1px solid rgba(139,92,246,0.2)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)',
          }}>

            {/* ── Card header band ── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(109,40,217,0.18) 0%, rgba(88,28,235,0.08) 100%)',
              borderBottom: '1px solid rgba(139,92,246,0.12)',
              padding: '28px 32px 24px',
            }}>
              {/* Brand row */}
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
                  flexShrink: 0,
                }}>
                  <WavifyLogo />
                </div>
                <div>
                  <p style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: '#f0f0ff', lineHeight: 1 }}>
                    Wavify
                  </p>
                  <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(160,145,200,0.7)', marginTop: 2, letterSpacing: '0.03em' }}>
                    Stream your world
                  </p>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h1 style={{
                  fontFamily: 'Instrument Serif, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 34,
                  fontWeight: 400,
                  color: '#f5f0ff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  marginBottom: 4,
                }}>
                  Welcome back
                </h1>
                <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'rgba(160,145,210,0.65)', letterSpacing: '0.01em' }}>
                  Sign in to continue listening
                </p>
              </motion.div>
            </div>

            {/* ── Form body ── */}
            <div style={{ padding: '24px 32px 32px' }}>

              {/* Social buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.38 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}
              >
                <button
                  onClick={() => handleSocial('google')}
                  disabled={!!socialLoading}
                  className="social-btn"
                  style={{ padding: '11px 14px', opacity: socialLoading && socialLoading !== 'google' ? 0.45 : 1 }}
                >
                  {socialLoading === 'google' ? <Spinner /> : <GoogleIcon />}
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleSocial('apple')}
                  disabled={!!socialLoading}
                  className="social-btn"
                  style={{ padding: '11px 14px', opacity: socialLoading && socialLoading !== 'apple' ? 0.45 : 1 }}
                >
                  {socialLoading === 'apple' ? <Spinner /> : <AppleIcon />}
                  <span>Apple</span>
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.34, duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(140,130,180,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.38 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Email field */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, color: 'rgba(190,175,230,0.75)', letterSpacing: '0.02em' }}>
                      Email address
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="email"
                      className="login-input"
                      style={{ padding: '12px 14px 12px 42px' }}
                    />
                    {/* Email icon */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={focusedField === 'email' ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'stroke 0.2s' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, color: 'rgba(190,175,230,0.75)', letterSpacing: '0.02em' }}>
                      Password
                    </span>
                    <a href="#" style={{ fontFamily: 'Geist, sans-serif', fontSize: 12, color: 'rgba(167,139,250,0.65)', textDecoration: 'none', letterSpacing: '0.01em', transition: 'color 0.15s' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(196,167,255,0.9)')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(167,139,250,0.65)')}>
                      Forgot?
                    </a>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('pass')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="current-password"
                      className="login-input"
                      style={{ padding: '12px 44px 12px 42px' }}
                    />
                    {/* Lock icon */}
                    <svg width="14" height="15" viewBox="0 0 24 24" fill="none" stroke={focusedField === 'pass' ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'stroke 0.2s' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    {/* Toggle */}
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(140,130,180,0.45)', display: 'flex', padding: 4, transition: 'color 0.15s', borderRadius: 6 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(190,175,230,0.75)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(140,130,180,0.45)')}>
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: -4 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 9,
                        padding: '11px 13px', borderRadius: 10, fontSize: 12.5,
                        background: 'rgba(244,63,94,0.08)',
                        color: 'rgba(252,165,165,0.95)',
                        border: '1px solid rgba(244,63,94,0.18)',
                        fontFamily: 'Geist, sans-serif',
                        lineHeight: 1.4,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button type="submit" disabled={loading || !!socialLoading} className="submit-btn"
                  style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2, position: 'relative' }}>
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {loading && <Spinner />}
                    {loading ? 'Signing in…' : 'Continue'}
                  </span>
                </button>
              </motion.form>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                style={{ textAlign: 'center', marginTop: 22, fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: 'rgba(140,130,180,0.5)', lineHeight: 1.5 }}
              >
                New to Wavify?{' '}
                <Link href="/signup"
                  style={{ color: 'rgba(196,167,255,0.85)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(196,167,255,0.25)', paddingBottom: 1, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(220,200,255,1)'; (e.target as HTMLElement).style.borderBottomColor = 'rgba(220,200,255,0.5)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(196,167,255,0.85)'; (e.target as HTMLElement).style.borderBottomColor = 'rgba(196,167,255,0.25)' }}
                >
                  Create a free account
                </Link>
              </motion.p>

              {/* Terms */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                style={{ textAlign: 'center', marginTop: 14, fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(120,110,160,0.4)', lineHeight: 1.6 }}
              >
                By continuing, you agree to our{' '}
                <a href="#" style={{ color: 'rgba(140,130,180,0.5)', textDecoration: 'none' }}>Terms</a>
                {' & '}
                <a href="#" style={{ color: 'rgba(140,130,180,0.5)', textDecoration: 'none' }}>Privacy Policy</a>
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
