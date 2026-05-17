'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const particles = [
  { x: '6%', y: '20%', size: 10, delay: 0, dur: 9 },
  { x: '90%', y: '18%', size: 7, delay: 2, dur: 11 },
  { x: '4%', y: '70%', size: 12, delay: 3.5, dur: 8 },
  { x: '93%', y: '65%', size: 8, delay: 1, dur: 10 },
  { x: '18%', y: '88%', size: 6, delay: 4, dur: 9 },
  { x: '78%', y: '90%', size: 9, delay: 2.5, dur: 7 },
]

function WavifyLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="white" fillOpacity="0.12"/>
      <path d="M5 20 Q8 10 11 20 Q14 30 17 20 Q20 10 23 20 Q26 30 27 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function MusicNote({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  )
}

export function AuthPage({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle: string
}) {
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatUp {
          0%{transform:translateY(0) rotate(0);opacity:0}
          10%{opacity:0.35}
          90%{opacity:0.1}
          100%{transform:translateY(-110px) rotate(18deg);opacity:0}
        }
        .particle { position: absolute; pointer-events: none; animation: floatUp linear infinite; }

        .auth-input {
          width: 100%; height: 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8e8f0; font-family: 'Geist', sans-serif;
          font-size: 14px; border-radius: 12px;
          outline: none; transition: all 0.25s;
          box-sizing: border-box; display: block;
        }
        .auth-input::placeholder { color: rgba(140,130,180,0.4); }
        .auth-input:focus {
          border-color: rgba(167,139,250,0.5);
          background: rgba(167,139,250,0.04);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.1);
        }

        .auth-btn {
          width: 100%; height: 50px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white; font-weight: 600; border: none;
          border-radius: 14px; cursor: pointer;
          font-size: 15px; font-family: 'Geist', sans-serif;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 24px rgba(109,40,217,0.35);
          transition: all 0.25s ease;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(109,40,217,0.5);
        }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .social-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%; height: 48px;
          color: rgba(230,230,255,0.88); cursor: pointer;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          transition: all 0.2s ease;
          font-size: 14px; font-family: 'Geist', sans-serif;
        }
        .social-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }

        .auth-error {
          padding: 12px 14px; border-radius: 12px;
          font-size: 13px;
          background: rgba(239,68,68,0.08);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.15);
        }

        .auth-success {
          padding: 12px 14px; border-radius: 12px;
          font-size: 13px;
          background: rgba(34,197,94,0.08);
          color: #86efac;
          border: 1px solid rgba(34,197,94,0.15);
        }

        @media (max-width: 480px) {
          .auth-container { padding: 12px !important; }
          .auth-card { border-radius: 20px !important; }
          .auth-header { padding: 24px 24px 20px !important; }
          .auth-body { padding: 20px 24px 28px !important; }
          .particle { display: none; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Geist, sans-serif',
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 90% 100%, rgba(88,28,235,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(167,139,250,0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }} />

        {/* Floating music notes */}
        {mounted && particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.x,
              top: p.y,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <MusicNote size={p.size} />
          </div>
        ))}

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="auth-container"
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10, padding: 20 }}
        >
          <div className="auth-card" style={{
            background: 'rgba(14,12,24,0.95)',
            backdropFilter: 'blur(40px)',
            borderRadius: 24,
            border: '1px solid rgba(139,92,246,0.15)',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div className="auth-header" style={{
              background: 'linear-gradient(180deg, rgba(109,40,217,0.08) 0%, rgba(88,28,235,0.03) 100%)',
              borderBottom: '1px solid rgba(139,92,246,0.1)',
              padding: '28px 32px 24px',
            }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.3)',
                }}>
                  <WavifyLogo />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 17, color: '#f0f0ff', lineHeight: 1.2 }}>Wavify</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(160,145,200,0.6)', marginTop: 2 }}>Stream your world</p>
                </div>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'Instrument Serif, serif',
                fontStyle: 'italic',
                fontSize: 34,
                fontWeight: 400,
                color: '#f8f4ff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                {title}
              </h1>
              <p style={{ fontSize: 13.5, color: 'rgba(160,145,210,0.6)', marginTop: 8 }}>
                {subtitle}
              </p>
            </div>

            {/* Body */}
            <div className="auth-body" style={{ padding: '24px 32px 32px' }}>
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// Shared components
export function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  )
}

export function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg width="15" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      <span style={{ fontSize: 11.5, color: 'rgba(140,130,180,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
    </div>
  )
}

interface InputFieldProps {
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  icon?: ReactNode
  showToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
  focused?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export function InputField({
  label, type, value, onChange, placeholder, icon,
  showToggle, showPassword, onTogglePassword, focused, onFocus, onBlur,
}: InputFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(190,175,230,0.7)', marginBottom: 8, fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, color: focused ? 'rgba(167,139,250,0.7)' : 'rgba(140,130,180,0.35)',
            transition: 'color 0.2s',
          }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="auth-input"
          style={{ padding: showToggle ? '0 48px 0 44px' : '0 16px 0 44px' }}
          required
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              zIndex: 10, color: 'rgba(140,130,180,0.4)',
              padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <EyeIcon open={showPassword ?? false} />
          </button>
        )}
      </div>
    </div>
  )
}

export function AuthLink({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(140,130,180,0.5)' }}>
      {text} <Link href={href} style={{ color: '#c4a7ff', textDecoration: 'none', fontWeight: 500 }}>{linkText}</Link>
    </p>
  )
}