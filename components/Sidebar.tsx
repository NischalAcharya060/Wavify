'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Playlist } from '@/lib/types'
import toast from 'react-hot-toast'
import { Home, Search, Library, Heart, Plus, Music2, LogOut, ListMusic, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const supabase = createClient()

  useEffect(() => { if (user) fetchPlaylists() }, [user])

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
    setPlaylists(data || [])
  }

  const createPlaylist = async () => {
    if (!newName.trim()) return
    await supabase.from('playlists').insert({ name: newName.trim(), user_id: user!.id })
    setNewName(''); setShowCreate(false); fetchPlaylists()
    toast.success('Playlist created')
  }

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/library', label: 'Library', icon: Library },
    { href: '/liked', label: 'Liked Songs', icon: Heart },
    { href: '/add-song', label: 'Add Song', icon: Plus },
  ]

  const sidebarW = collapsed ? 60 : 220

  return (
    <>
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: sidebarW, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100%', overflow: 'hidden',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 14px', flexShrink: 0 }}>
          {!collapsed ? (
            <>
              <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Music2 size={14} color="white" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Wavify</span>
              </Link>
              <button onClick={onToggle} className="btn-icon" style={{ width: 26, height: 26 }}>
                <ChevronLeft size={15} />
              </button>
            </>
          ) : (
            <button onClick={onToggle} className="btn-icon" style={{ width: 32, height: 32 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music2 size={13} color="white" />
              </div>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 8px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`nav-item ${active ? 'active' : ''}`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '8px 10px' }}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '10px 12px', flexShrink: 0 }} />

        {/* Playlists */}
        {!collapsed && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                PLAYLISTS
              </span>
              <button onClick={() => setShowCreate(true)} className="btn-icon" style={{ width: 22, height: 22 }}>
                <Plus size={13} />
              </button>
            </div>
            {playlists.map(pl => (
              <Link key={pl.id} href={`/playlist/${pl.id}`}
                className={`nav-item ${pathname === `/playlist/${pl.id}` ? 'active' : ''}`}
                style={{ gap: 8, padding: '7px 8px' }}>
                <ListMusic size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
              </Link>
            ))}
            {playlists.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px' }}>No playlists yet</p>
            )}
          </div>
        )}

        {/* User footer */}
        {user && (
          <div style={{ padding: '8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {collapsed ? (
              <button onClick={signOut} className="btn-icon" style={{ width: '100%', height: 36, borderRadius: 8 }} title="Sign out">
                <LogOut size={14} />
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-elevated)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'white' }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {user.email?.split('@')[0]}
                </span>
                <button onClick={signOut} className="btn-icon" style={{ width: 24, height: 24 }} title="Sign out">
                  <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.17 }}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16 }}>New Playlist</h3>
                <button onClick={() => setShowCreate(false)} className="btn-icon" style={{ width: 28, height: 28 }}><X size={15} /></button>
              </div>
              <input type="text" placeholder="Playlist name…" value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                className="input-dark"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}
                autoFocus />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCreate(false)} className="btn-ghost" style={{ flex: 1, padding: '10px', borderRadius: 10 }}>Cancel</button>
                <button onClick={createPlaylist} className="btn-primary" style={{ flex: 1, padding: '10px', borderRadius: 10 }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
