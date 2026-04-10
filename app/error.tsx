'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#08080f', color: '#fff', fontFamily: 'DM Sans, sans-serif',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
          background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={32} color="#f43f5e" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
            }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/home" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 14,
          }}>
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
