'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 16px', height: 56, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* History */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {[ChevronLeft, ChevronRight].map((Icon, i) => (
          <button key={i} onClick={() => i === 0 ? router.back() : router.forward()}
            className="btn-icon"
            style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)' }}>
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420 }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Search songs…" value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-dark"
            style={{ width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 20, fontSize: 13 }}
          />
        </div>
      </form>

      {/* Profile */}
      <div ref={dropRef} style={{ marginLeft: 'auto', position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setShowProfile(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initial}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email?.split('@')[0]}
          </span>
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.14 }}
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)',
                borderRadius: 12, minWidth: 200, padding: 6,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50,
              }}>
              <div style={{ padding: '10px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email?.split('@')[0]}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
              <Link href="/profile" onClick={() => setShowProfile(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <User size={14} /> Profile
              </Link>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={() => { signOut(); setShowProfile(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s', fontFamily: 'DM Sans,sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <LogOut size={14} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
