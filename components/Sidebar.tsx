'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Playlist } from '@/lib/types'
import toast from 'react-hot-toast'
import {
  Home, Search, Library, Heart, Plus, Music2,
  LogOut, ListMusic, ChevronLeft, ChevronRight, X
} from 'lucide-react'

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
    const { data } = await supabase
      .from('playlists').select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setPlaylists(data || [])
  }

  const createPlaylist = async () => {
    if (!newName.trim()) return
    const { error } = await supabase.from('playlists').insert({ name: newName.trim(), user_id: user!.id })
    if (!error) { setNewName(''); setShowCreate(false); fetchPlaylists(); toast.success('Playlist created') }
    else toast.error('Failed to create playlist')
  }

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/library', label: 'Library', icon: Library },
    { href: '/liked', label: 'Liked Songs', icon: Heart },
    { href: '/add-song', label: 'Add Song', icon: Plus },
  ]

  const w = collapsed ? 64 : 240

  return (
    <>
      <motion.aside
        animate={{ width: w }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col h-full shrink-0 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center px-4 py-5 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))' }}>
                  <Music2 size={14} color="white" />
                </div>
                <span className="text-lg font-black" style={{ fontFamily: 'Syne,sans-serif' }}>Wavify</span>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))' }}>
              <Music2 size={14} color="white" />
            </div>
          )}
          {!collapsed && (
            <button onClick={onToggle} className="btn-icon w-7 h-7" title="Collapse sidebar">
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand btn when collapsed */}
        {collapsed && (
          <button onClick={onToggle} className="btn-icon mx-auto w-7 h-7 mb-2" title="Expand sidebar">
            <ChevronRight size={16} />
          </button>
        )}

        {/* Nav */}
        <nav className="px-2 shrink-0 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={17} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 my-3 shrink-0" style={{ height: 1, background: 'var(--border)' }} />

        {/* Playlists section */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto px-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Playlists
              </span>
              <button onClick={() => setShowCreate(true)} className="btn-icon w-6 h-6" title="New playlist">
                <Plus size={14} />
              </button>
            </div>
            <AnimatePresence>
              {playlists.map((pl, i) => (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/playlist/${pl.id}`}
                    className={`nav-item text-xs ${pathname === `/playlist/${pl.id}` ? 'active' : ''}`}
                  >
                    <ListMusic size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span className="truncate">{pl.name}</span>
                  </Link>
                </motion.div>
              ))}
              {playlists.length === 0 && (
                <p className="px-2 text-xs py-2" style={{ color: 'var(--text-muted)' }}>No playlists yet</p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User */}
        {user && (
          <div className={`p-2 shrink-0 mt-auto border-t`} style={{ borderColor: 'var(--border)' }}>
            {collapsed ? (
              <button onClick={signOut} className="btn-icon w-full h-9 rounded-xl" title="Sign out">
                <LogOut size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-2 py-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white' }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {user.email?.split('@')[0]}
                </span>
                <button onClick={signOut} className="btn-icon w-6 h-6" title="Sign out">
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Create playlist modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="glass rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">New Playlist</h3>
                <button onClick={() => setShowCreate(false)} className="btn-icon w-7 h-7"><X size={16} /></button>
              </div>
              <input
                type="text"
                placeholder="Playlist name…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                className="input-dark w-full px-4 py-3 rounded-xl mb-4 text-sm"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
                <button onClick={createPlaylist} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
