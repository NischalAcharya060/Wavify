'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
          background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={28} color="#f43f5e" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Something went wrong</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
          We hit an unexpected error. Try refreshing or head back home.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
            }}
          >
            <RefreshCw size={15} /> Retry
          </button>
          <Link href="/home" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 13,
          }}>
            <Home size={15} /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
