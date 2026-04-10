'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

const particles = [
  { x: '6%',  y: '20%', size: 10, delay: 0,   dur: 9  },
  { x: '90%', y: '18%', size: 7,  delay: 2,   dur: 11 },
  { x: '4%',  y: '70%', size: 12, delay: 3.5, dur: 8  },
  { x: '93%', y: '65%', size: 8,  delay: 1,   dur: 10 },
  { x: '18%', y: '88%', size: 6,  delay: 4,   dur: 9  },
  { x: '78%', y: '90%', size: 9,  delay: 2.5, dur: 7  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false) } else router.push('/home')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } })
  }

  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatUp { 0%{transform:translateY(0) rotate(0);opacity:0} 10%{opacity:0.35} 90%{opacity:0.1} 100%{transform:translateY(-110px) rotate(18deg);opacity:0} }
        .signup-input { width: 100%; height: 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #f0f0f8; font-family: 'Geist', sans-serif; font-size: 14px; border-radius: 12px; outline: none; transition: all 0.2s; box-sizing: border-box; display: block; }
        .signup-input:focus { border-color: rgba(167,139,250,0.55); background: rgba(167,139,250,0.05); box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
        .social-btn-s { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 44px; color: rgba(230,230,255,0.85); cursor: pointer; border-radius: 12px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04); transition: all 0.18s; font-size: 13.5px; }
        .submit-btn-s { width: 100%; height: 46px; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(109,40,217,0.4); }
        .submit-btn-s:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(109,40,217,0.55); }
        .particle { position: absolute; pointer-events: none; animation: floatUp linear infinite; }
        @media (max-width: 480px) {
          .login-container { padding: 12px !important; }
          .login-card { border-radius: 18px !important; }
          .login-header { padding: 20px 20px 16px !important; }
          .login-body { padding: 16px 20px 24px !important; }
          .particle { display: none; }
        }
      `}</style>

        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f', position: 'relative', overflow: 'hidden', fontFamily: 'Geist, sans-serif' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 80% 10%, rgba(88,28,235,0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(124,58,237,0.1) 0%, transparent 55%)', pointerEvents: 'none' }} />
          {mounted && particles.map((p, i) => (
              <div key={i} className="particle" style={{ left: p.x, top: p.y, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
                <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
          ))}

          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="login-container" style={{ width: '100%', maxWidth: 416, position: 'relative', zIndex: 10, padding: 16 }}>
            <div className="login-card" style={{ background: 'rgba(12,10,22,0.9)', backdropFilter: 'blur(32px)', borderRadius: 23, border: '1px solid rgba(139,92,246,0.18)', overflow: 'hidden' }}>
              <div className="login-header" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(88,28,235,0.07) 100%)', borderBottom: '1px solid rgba(139,92,246,0.1)', padding: '26px 32px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WavifyLogo /></div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 16, color: '#f0f0ff', lineHeight: 1 }}>Wavify</p>
                    <p style={{ fontSize: 11, color: 'rgba(160,145,200,0.65)', marginTop: 2 }}>Stream your world</p>
                  </div>
                </div>
                <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 400, color: '#f5f0ff', lineHeight: 1.1 }}>Welcome Back</h1>
                <p style={{ fontSize: 13, color: 'rgba(160,145,210,0.6)' }}>Login to your account</p>
              </div>

              <div className="login-body" style={{ padding: '22px 32px 30px' }}>
                <button onClick={handleGoogle} disabled={googleLoading} className="social-btn-s" style={{ marginBottom: 18 }}>
                  {googleLoading ? <Spinner /> : <GoogleIcon />} Sign in with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(140,130,180,0.45)', textTransform: 'uppercase' }}>or with email</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(190,175,230,0.7)', marginBottom: 6 }}>Email address</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: focusedField === 'email' ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="signup-input" style={{ padding: '0 16px 0 38px' }} placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(190,175,230,0.7)', marginBottom: 6 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: focusedField === 'pass' ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.4)' }}>
                        <svg width="13" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)} className="signup-input" style={{ padding: '0 16px 0 38px' }} placeholder="••••••••••" required />
                    </div>
                  </div>
                  {error && <div style={{ padding: '10px', borderRadius: 10, fontSize: 12, background: 'rgba(244,63,94,0.1)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</div>}
                  <button type="submit" disabled={loading} className="submit-btn-s">{loading ? <Spinner /> : 'Sign In'}</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/reset-password" style={{ fontSize: 12.5, color: 'rgba(167,139,250,0.6)', textDecoration: 'none' }}>
                    Forgot your password?
                  </Link>
                  <p style={{ fontSize: 12.5, color: 'rgba(140,130,180,0.5)' }}>
                    New to Wavify? <Link href="/signup" style={{ color: '#c4a7ff', textDecoration: 'none' }}>Create account</Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
  )
}