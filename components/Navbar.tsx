'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, User, Settings, LogOut, Music2 } from 'lucide-react'
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
    <header
      className="flex items-center gap-4 px-5 py-3 shrink-0"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', minHeight: 60 }}
    >
      {/* History nav */}
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => router.back()}
          className="btn-icon w-8 h-8 rounded-full"
          style={{ background: 'var(--bg-elevated)' }}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => router.forward()}
          className="btn-icon w-8 h-8 rounded-full"
          style={{ background: 'var(--bg-elevated)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search songs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-dark w-full pl-9 pr-4 py-2 rounded-full text-sm"
          />
        </div>
      </form>

      {/* Profile dropdown */}
      <div className="relative ml-auto shrink-0" ref={dropRef}>
        <button
          onClick={() => setShowProfile(v => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-all hover:bg-white/5"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white' }}
          >
            {initial}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            {user?.email?.split('@')[0]}
          </span>
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', minWidth: 200 }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white' }}>
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <Link href="/profile" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
                  <User size={15} /> Profile
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button onClick={() => { signOut(); setShowProfile(false) }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-red-500/10 text-left"
                  style={{ color: 'var(--danger)' }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
