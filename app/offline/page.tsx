'use client'

import Link from 'next/link'
import { WifiOff, RotateCw } from 'lucide-react'

export default function OfflinePage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'radial-gradient(ellipse at top, #1a1640 0%, #08080f 60%)',
            color: '#fff',
            textAlign: 'center',
        }}>
            <div style={{ maxWidth: 420 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: 'linear-gradient(135deg, #7c6af7, #3b2fa8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 12px 40px rgba(124,106,247,0.35)',
                }}>
                    <WifiOff size={32} color="#fff" />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                    You're offline
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: '0 0 24px' }}>
                    Wavify needs a connection to stream tracks from YouTube. Reconnect and try again — your library is safe.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => location.reload()}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: '#7c6af7', color: '#fff',
                            border: 'none', padding: '10px 18px',
                            borderRadius: 12, fontSize: 14, fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <RotateCw size={16} /> Retry
                    </button>
                    <Link
                        href="/home"
                        style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff', textDecoration: 'none',
                            padding: '10px 18px',
                            borderRadius: 12, fontSize: 14, fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    )
}
