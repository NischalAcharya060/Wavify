import Link from 'next/link'
import { Music2, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#08080f', color: '#fff', fontFamily: 'DM Sans, sans-serif',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,58,237,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ textAlign: 'center', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px',
          background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Music2 size={36} color="#a78bfa" />
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 800, color: 'rgba(167,139,250,0.15)', lineHeight: 1, marginBottom: 8 }}>
          404
        </h1>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/home" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}>
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
