'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Playlist } from '@/lib/types'
import toast from 'react-hot-toast'
import { Home, Search, Library, Heart, Plus, Music2, LogOut, ListMusic, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'

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

    const sidebarW = collapsed ? 80 : 260

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          margin: 2px 0;
        }
        .sidebar-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.04);
        }
        .sidebar-link.active {
          color: #fff;
          background: rgba(124, 58, 237, 0.1);
        }
        .sidebar-link.active svg {
          color: #a78bfa;
        }
        .playlist-scroll::-webkit-scrollbar { width: 4px; }
        .playlist-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

            <motion.aside
                animate={{ width: sidebarW }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                style={{
                    width: sidebarW, flexShrink: 0, display: 'flex', flexDirection: 'column',
                    height: '100%', overflow: 'hidden',
                    background: 'rgba(8, 8, 15, 0.5)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    zIndex: 45
                }}
            >
                {/* Logo Section */}
                <div style={{
                    height: 80, display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: '0 20px', flexShrink: 0
                }}>
                    {!collapsed ? (
                        <>
                            <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                                }}>
                                    <Music2 size={16} color="white" />
                                </div>
                                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.5px' }}>Wavify</span>
                            </Link>
                            <button onClick={onToggle} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    ) : (
                        <button onClick={onToggle} style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', cursor: 'pointer'
                        }}>
                            <Music2 size={20} color="white" />
                        </button>
                    )}
                </div>

                {/* Primary Navigation */}
                <nav style={{ padding: '0 12px', flexShrink: 0 }}>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <Link key={href} href={href}
                                  className={`sidebar-link ${active ? 'active' : ''}`}
                                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                            >
                                <Icon size={18} />
                                {!collapsed && <span>{label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 24px', flexShrink: 0 }} />

                {/* Playlists Section */}
                <div className="playlist-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                    {!collapsed && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>PLAYLISTS</span>
                                <button onClick={() => setShowCreate(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#fff', padding: '2px', cursor: 'pointer' }}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            {playlists.map(pl => (
                                <Link key={pl.id} href={`/playlist/${pl.id}`}
                                      className={`sidebar-link ${pathname === `/playlist/${pl.id}` ? 'active' : ''}`}
                                      style={{ gap: 10, padding: '8px 12px' }}>
                                    <ListMusic size={16} color={pathname === `/playlist/${pl.id}` ? '#a78bfa' : 'rgba(255,255,255,0.2)'} />
                                    <span style={{ fontSize: 13, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{pl.name}</span>
                                </Link>
                            ))}
                        </>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div style={{ padding: '16px', flexShrink: 0 }}>
                    {collapsed ? (
                        <button onClick={signOut} style={{
                            width: '100%', height: 48, borderRadius: 14,
                            background: 'rgba(251, 113, 133, 0.1)', border: 'none',
                            color: '#fb7185', cursor: 'pointer'
                        }}>
                            <LogOut size={18} />
                        </button>
                    ) : (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16, padding: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: '#fff'
                                }}>
                                    {user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.email?.split('@')[0]}
                                    </p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Premium Plan</p>
                                </div>
                            </div>
                            <button onClick={signOut} style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '10px', borderRadius: 10, background: 'rgba(251, 113, 133, 0.1)',
                                border: 'none', color: '#fb7185', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                            }}>
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Modern Modal Overlay */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 24, padding: 32, width: '100%', maxWidth: 400,
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                                        <Sparkles size={20} />
                                    </div>
                                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff' }}>New Playlist</h3>
                                </div>
                                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <input
                                type="text"
                                placeholder="Give your playlist a name..."
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                                    padding: '14px 18px', color: '#fff', fontSize: 15, marginBottom: 24,
                                    outline: 'none'
                                }}
                                autoFocus
                            />

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={createPlaylist} style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#fff', color: '#08080f', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create Playlist</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}