'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Playlist } from '@/lib/types'
import toast from 'react-hot-toast'
import { Home, Search, Library, Heart, Plus, Music2, LogOut, ListMusic, ChevronLeft, Settings, ShieldCheck } from 'lucide-react'

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
    const createInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const googleAvatar = user?.user_metadata?.avatar_url
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    const initial = displayName[0]?.toUpperCase() ?? 'U'

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
        { href: '/settings', label: 'Settings', icon: Settings },
    ]

    const sidebarW = collapsed ? 80 : 260

    return (
        <>
            <style>{`
                .sidebar-link {
                  display: flex; align-items: center; gap: 12px; padding: 10px 16px;
                  border-radius: 12px; color: rgba(255, 255, 255, 0.5);
                  text-decoration: none; font-size: 14px; font-weight: 500;
                  transition: all 0.2s ease; margin: 2px 0; white-space: nowrap;
                  position: relative;
                }
                .sidebar-link:hover { color: #fff; background: rgba(255, 255, 255, 0.04); }
                .sidebar-link.active { color: #fff; background: rgba(124, 58, 237, 0.1); }
                .sidebar-link.active svg { color: #a78bfa; }
                .playlist-scroll::-webkit-scrollbar { width: 4px; }
                .playlist-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }

                /* Tooltip for collapsed sidebar */
                .sidebar-link[data-tooltip]:hover::after {
                  content: attr(data-tooltip);
                  position: absolute; left: calc(100% + 12px); top: 50%;
                  transform: translateY(-50%);
                  padding: 6px 12px; background: rgba(20,20,32,0.95);
                  border: 1px solid rgba(255,255,255,0.1);
                  border-radius: 8px; font-size: 12px; color: #fff;
                  white-space: nowrap; pointer-events: none; z-index: 2000;
                  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                }
            `}</style>

            <motion.aside
                animate={{ width: sidebarW }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                role="navigation"
                aria-label="Main navigation"
                style={{
                    flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%',
                    overflow: 'hidden', background: '#08080f', borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                }}
            >
                {/* Logo Section */}
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '0' : '0 20px', flexShrink: 0 }}>
                    <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Music2 size={20} color="white" />
                        </div>
                        {!collapsed && <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Wavify</span>}
                    </Link>
                    {!collapsed && (
                        <button onClick={onToggle} aria-label="Collapse sidebar" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Primary Navigation */}
                <nav style={{ padding: '0 12px', flexShrink: 0 }}>
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                          style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '12px 0' : '10px 16px' }}
                          aria-label={label}
                          {...(collapsed ? { 'data-tooltip': label } : {})}
                        >
                            <Icon size={20} style={{ flexShrink: 0 }} />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    ))}
                </nav>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 24px', flexShrink: 0 }} />

                {/* Playlists Section */}
                <div className="playlist-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>PLAYLISTS</span>
                            <button onClick={() => { setShowCreate(true); setTimeout(() => createInputRef.current?.focus(), 100) }} aria-label="Create playlist" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#fff', padding: '2px', cursor: 'pointer' }}>
                                <Plus size={14} />
                            </button>
                        </div>
                    )}

                    {playlists.length === 0 && !collapsed && (
                      <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <ListMusic size={24} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 8 }} />
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No playlists yet</p>
                      </div>
                    )}

                    {playlists.map(pl => (
                        <Link
                          key={pl.id}
                          href={`/playlist/${pl.id}`}
                          className={`sidebar-link ${pathname === `/playlist/${pl.id}` ? 'active' : ''}`}
                          style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '12px 0' : '8px 12px' }}
                          {...(collapsed ? { 'data-tooltip': pl.name } : {})}
                        >
                            <ListMusic size={20} style={{ flexShrink: 0 }} />
                            {!collapsed && <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{pl.name}</span>}
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    {!collapsed ? (
                        <div style={{
                            width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16, padding: '12px'
                        }}>
                            <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                {googleAvatar ? (
                                    <img src={googleAvatar} alt="User avatar" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0
                                    }}>
                                        {initial}
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {displayName}
                                        <ShieldCheck size={12} color="#10b981" />
                                    </p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                                </div>
                            </Link>
                            <button onClick={signOut} aria-label="Sign out" style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '10px', borderRadius: 10, background: 'rgba(251, 113, 133, 0.1)',
                                border: 'none', color: '#fb7185', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                            }}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                            <Link href="/profile" aria-label="Profile">
                                {googleAvatar ? (
                                    <img src={googleAvatar} alt="User avatar" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                ) : (
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
                                        {initial}
                                    </div>
                                )}
                            </Link>
                            <button onClick={signOut} aria-label="Sign out" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251, 113, 133, 0.1)', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Create Playlist Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 32, width: '90%', maxWidth: 400 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 20 }}>New Playlist</h3>
                            <input
                              ref={createInputRef}
                              type="text"
                              placeholder="Playlist name"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', color: '#fff', marginBottom: 24, outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={createPlaylist} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#fff', color: '#08080f', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
