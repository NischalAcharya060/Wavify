'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

/* ───────────────────────── Icons ───────────────────────── */

function WavifyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="url(#wgrad)" />
      <path d="M5 20 Q8 10 11 20 Q14 30 17 20 Q20 10 23 20 Q26 30 27 20"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8Z" fill="#a78bfa"/>
      <path d="M10 15V9l5 3-5 3Z" fill="#0e0c18"/>
    </svg>
  )
}

function PlaylistIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 6h13M3 12h13M3 18h9"/>
      <circle cx="19" cy="17" r="3" fill="#a78bfa"/>
      <path d="M19 14V7l3-1" stroke="#a78bfa"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2M21 12h-2"/>
    </svg>
  )
}

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7L8 5Z"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f472b6">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/>
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  )
}

/* ───────────────────────── Feature data ───────────────────────── */

const features = [
  {
    icon: <YouTubeIcon />,
    title: 'YouTube-powered',
    body: 'Stream music straight from YouTube. Anything you can find there, you can play here.',
  },
  {
    icon: <PlaylistIcon />,
    title: 'Build playlists',
    body: 'Group your favorites, drag to reorder, and keep your library yours.',
  },
  {
    icon: <SparkleIcon />,
    title: 'AI suggestions',
    body: 'Ask the built-in AI for recommendations based on a mood, a vibe, or an artist.',
  },
  {
    icon: <WaveIcon />,
    title: 'Smooth playback',
    body: 'Queue, shuffle, repeat, media keys, and a player that just stays out of the way.',
  },
]

/* ───────────────────────── Component ───────────────────────── */

export default function LandingClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    // Body has overflow:hidden globally (set in globals.css). The landing
    // page is a full document, so we override it for this route only.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

        .landing-root {
          min-height: 100vh;
          background: #08080f;
          color: #eee;
          font-family: 'Geist', 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .landing-bg {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 20% 0%, rgba(124,58,237,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 90% 30%, rgba(88,28,235,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 90%, rgba(167,139,250,0.10) 0%, transparent 60%);
        }

        .landing-nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px clamp(20px, 5vw, 56px);
          backdrop-filter: blur(8px);
        }
        .landing-nav-brand {
          display: flex; align-items: center; gap: 10px;
          font-weight: 700; letter-spacing: -0.01em; font-size: 17px;
        }
        .landing-nav-actions { display: flex; align-items: center; gap: 10px; }

        .nav-link {
          color: rgba(230,225,250,0.75);
          font-size: 14px; font-weight: 500;
          padding: 9px 16px; border-radius: 12px;
          text-decoration: none;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }

        .nav-cta {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #fff;
          font-size: 14px; font-weight: 600;
          padding: 10px 18px; border-radius: 12px;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          box-shadow: 0 4px 18px rgba(109,40,217,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(109,40,217,0.5); }

        .hero {
          position: relative; z-index: 5;
          max-width: 1120px; margin: 0 auto;
          padding: clamp(48px, 8vw, 96px) clamp(20px, 5vw, 56px) clamp(64px, 9vw, 120px);
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(28px, 5vw, 64px);
          align-items: center;
        }
        @media (max-width: 880px) {
          .hero { grid-template-columns: 1fr; gap: 48px; padding-top: 32px; }
        }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd;
          font-size: 12.5px; font-weight: 500;
          margin-bottom: 24px;
        }
        .hero-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a78bfa; box-shadow: 0 0 8px #a78bfa;
        }

        .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(44px, 7vw, 76px);
          line-height: 1.02;
          letter-spacing: -0.025em;
          color: #f8f4ff;
          margin: 0 0 24px;
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          font-size: clamp(15px, 1.5vw, 17.5px);
          color: rgba(200,195,225,0.7);
          line-height: 1.6;
          max-width: 540px;
          margin: 0 0 32px;
        }

        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary-lg {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 26px; border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #fff; font-weight: 600; font-size: 15px;
          text-decoration: none;
          box-shadow: 0 6px 28px rgba(109,40,217,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary-lg:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(109,40,217,0.55); }
        .btn-secondary-lg {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 26px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          color: rgba(240,235,255,0.92); font-weight: 500; font-size: 15px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-secondary-lg:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(167,139,250,0.35);
        }

        .hero-meta {
          margin-top: 32px;
          display: flex; gap: 28px; flex-wrap: wrap;
          color: rgba(180,170,210,0.55); font-size: 13px;
        }
        .hero-meta strong { color: #c4b5fd; font-weight: 600; }

        /* Player preview */
        .player-mock {
          position: relative;
          background: rgba(14,12,24,0.85);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 24px;
          padding: 22px;
          box-shadow:
            0 32px 72px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.02) inset;
        }
        .player-mock::before {
          content: ''; position: absolute; inset: -1px;
          border-radius: 24px; padding: 1px;
          background: linear-gradient(135deg, rgba(167,139,250,0.4), transparent 50%, rgba(124,58,237,0.3));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .player-art {
          aspect-ratio: 1;
          border-radius: 16px;
          background:
            radial-gradient(ellipse at 30% 20%, #c084fc 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, #8b5cf6 0%, transparent 55%),
            linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%);
          position: relative; overflow: hidden;
          margin-bottom: 18px;
        }
        .player-art-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .player-art-orb {
          width: 88px; height: 88px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #a78bfa 60%, transparent 70%);
          opacity: 0.7;
          filter: blur(2px);
        }
        .player-track-row {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
        }
        .player-track-title {
          font-size: 17px; font-weight: 600; color: #f0eaff;
          letter-spacing: -0.01em;
        }
        .player-track-artist {
          font-size: 13px; color: rgba(180,170,210,0.6); margin-top: 3px;
        }
        .player-progress {
          margin-top: 18px;
          height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.06);
          overflow: hidden; position: relative;
        }
        .player-progress-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 42%;
          background: linear-gradient(90deg, #a78bfa, #7c3aed);
          border-radius: 2px;
        }
        .player-times {
          display: flex; justify-content: space-between;
          font-size: 11.5px; color: rgba(180,170,210,0.5);
          margin-top: 8px; font-variant-numeric: tabular-nums;
        }
        .player-controls {
          margin-top: 16px;
          display: flex; align-items: center; justify-content: center; gap: 18px;
        }
        .player-btn {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: rgba(220,210,250,0.7);
          cursor: default;
        }
        .player-btn-main {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(124,58,237,0.5);
        }

        /* Features */
        .features {
          position: relative; z-index: 5;
          max-width: 1120px; margin: 0 auto;
          padding: clamp(56px, 8vw, 96px) clamp(20px, 5vw, 56px);
        }
        .features-header { text-align: center; margin-bottom: 56px; }
        .features-eyebrow {
          font-size: 12.5px; font-weight: 500; letter-spacing: 0.08em;
          color: #a78bfa; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .features-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: clamp(32px, 4.5vw, 48px);
          color: #f8f4ff;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
        }
        .features-sub {
          color: rgba(200,195,225,0.65);
          font-size: 15.5px;
          max-width: 560px; margin: 0 auto;
          line-height: 1.6;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }
        .feature-card {
          background: rgba(20,16,32,0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 18px;
          padding: 24px;
          transition: transform 0.25s, border-color 0.25s, background 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          background: rgba(28,22,44,0.7);
          border-color: rgba(167,139,250,0.32);
        }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(167,139,250,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .feature-title {
          font-size: 16.5px; font-weight: 600; color: #f0eaff;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .feature-body {
          font-size: 13.5px;
          color: rgba(180,170,210,0.68);
          line-height: 1.55;
          margin: 0;
        }

        /* Final CTA */
        .final-cta {
          position: relative; z-index: 5;
          max-width: 1120px; margin: 0 auto;
          padding: clamp(40px, 7vw, 80px) clamp(20px, 5vw, 56px);
          text-align: center;
        }
        .final-cta-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(88,28,235,0.10) 100%);
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 24px;
          padding: clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px);
          backdrop-filter: blur(20px);
        }
        .final-cta-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: clamp(30px, 4.5vw, 44px);
          color: #f8f4ff;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
        }
        .final-cta-sub {
          color: rgba(200,195,225,0.7);
          font-size: 15px; line-height: 1.6;
          max-width: 480px; margin: 0 auto 28px;
        }

        /* Footer */
        .landing-footer {
          position: relative; z-index: 5;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 28px clamp(20px, 5vw, 56px);
          color: rgba(160,150,185,0.55);
          font-size: 13px;
          display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
          max-width: 1120px; margin: 0 auto;
        }
        .landing-footer a {
          color: rgba(200,190,225,0.75);
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-footer a:hover { color: #c4b5fd; }

        @media (max-width: 540px) {
          .nav-link.hide-sm { display: none; }
          .hero-meta { gap: 18px; }
        }
      `}</style>

      <div className="landing-root">
        <div className="landing-bg" />

        {/* Nav */}
        <nav className="landing-nav">
          <div className="landing-nav-brand">
            <WavifyLogo />
            <span>Wavify</span>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="nav-link hide-sm">Sign in</Link>
            <Link href="/signup" className="nav-cta">Get started <ArrowRight /></Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Powered by YouTube · Free forever
            </div>
            <h1 className="hero-title">
              Stream <em>your</em> world,<br />
              one track at a time.
            </h1>
            <p className="hero-sub">
              Wavify is a personal music streaming app built on YouTube. Search anything,
              build playlists, ask the AI for recommendations, and play it all from a
              player that gets out of your way.
            </p>
            <div className="hero-ctas">
              <Link href="/signup" className="btn-primary-lg">
                Get started — it&apos;s free <ArrowRight />
              </Link>
              <Link href="/login" className="btn-secondary-lg">
                I already have an account
              </Link>
            </div>
            <div className="hero-meta">
              <div><strong>No ads</strong> · No tracking</div>
              <div><strong>Free</strong> · Sign up in seconds</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={mounted ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="player-mock"
            aria-hidden="true"
          >
            <div className="player-art">
              <div className="player-art-overlay">
                <motion.div
                  className="player-art-orb"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.9, 0.7] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <div className="player-track-row">
              <div>
                <div className="player-track-title">Midnight Drift</div>
                <div className="player-track-artist">Luma · Slow Currents</div>
              </div>
              <HeartIcon />
            </div>
            <div className="player-progress">
              <motion.div
                className="player-progress-fill"
                initial={{ width: '12%' }}
                animate={mounted ? { width: '62%' } : undefined}
                transition={{ duration: 8, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
            <div className="player-times">
              <span>1:48</span>
              <span>−2:32</span>
            </div>
            <div className="player-controls">
              <button className="player-btn" tabIndex={-1} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6 9 12l11 6V6z"/></svg>
              </button>
              <button className="player-btn player-btn-main" tabIndex={-1} aria-hidden="true">
                <PlayIcon size={20} />
              </button>
              <button className="player-btn" tabIndex={-1} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4 18l11-6L4 6v12z"/></svg>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="features-header">
            <div className="features-eyebrow">Why Wavify</div>
            <h2 className="features-title">Everything you need, nothing you don&apos;t.</h2>
            <p className="features-sub">
              A focused listening experience built around the music you already love finding online.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="feature-card"
              >
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="final-cta-card"
          >
            <h2 className="final-cta-title">Ready to press play?</h2>
            <p className="final-cta-sub">
              Sign up free with email or Google. Your library, your playlists, your way.
            </p>
            <Link href="/signup" className="btn-primary-lg">
              Create your account <ArrowRight />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div>© {new Date().getFullYear()} Wavify · Built by Nischal Acharya</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Sign up</Link>
            <a href="https://acharyanischal.com.np" target="_blank" rel="noopener noreferrer">
              Developer site
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}
