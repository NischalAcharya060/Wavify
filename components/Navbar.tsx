'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, LogOut, Menu as MenuIcon, ShieldCheck, Settings, Keyboard } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
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

    const googleAvatar = user?.user_metadata?.avatar_url
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    const initial = displayName[0]?.toUpperCase() ?? 'U'

    return (
        <header className="navbar-container" role="banner" style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '0 32px', height: 72, flexShrink: 0,
            background: 'transparent', zIndex: 40, position: 'relative'
        }}>
            <style>{`
                .nav-btn {
                  width: 38px; height: 38px; border-radius: 12px;
                  display: flex; align-items: center; justify-content: center;
                  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.03);
                  color: #fff; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nav-btn:hover { background: rgba(255, 255, 255, 0.08); transform: scale(1.02); }
                .nav-btn:active { transform: scale(0.95); background: rgba(255, 255, 255, 0.1); }
                .profile-trigger {
                  display: flex; align-items: center; gap: 8px;
                  padding: 4px 14px 4px 4px; border-radius: 100px;
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  background: rgba(255, 255, 255, 0.03); cursor: pointer; transition: 0.2s;
                }
                .profile-trigger:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); }
                .dropdown-item {
                  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
                  border-radius: 10px; font-size: 13px; color: #ccc; text-decoration: none;
                  transition: background 0.15s; width: 100%; border: none; background: transparent; cursor: pointer;
                  text-align: left;
                }
                .dropdown-item:hover { background: rgba(255,255,255,0.05); }
                @media (max-width: 1024px) {
                  .mobile-toggle { display: flex !important; }
                  .navbar-container { padding: 0 16px !important; height: 64px !important; }
                  .nav-history { display: none !important; }
                  .user-name-label { display: none !important; }
                  .profile-trigger { padding: 4px !important; border-radius: 50% !important; }
                }
            `}</style>

            {/* Mobile Menu */}
            <button onClick={onMenuClick} className="nav-btn mobile-toggle" aria-label="Open menu" style={{ display: 'none' }}>
                <MenuIcon size={20} />
            </button>

            {/* Navigation History */}
            <div className="nav-history" style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => router.back()} className="nav-btn" aria-label="Go back" title="Go Back">
                    <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
                <button onClick={() => router.forward()} className="nav-btn" aria-label="Go forward" title="Go Forward">
                    <ChevronRight size={22} strokeWidth={2.5} />
                </button>
            </div>

            {/* Profile Section */}
            <div ref={dropRef} style={{ marginLeft: 'auto', position: 'relative' }}>
                <motion.button
                    className="profile-trigger"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfile(!showProfile)}
                    aria-label="Profile menu"
                    aria-expanded={showProfile}
                >
                    {googleAvatar ? (
                        <img src={googleAvatar} alt="Avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color: 'white'
                        }}>
                            {initial}
                        </div>
                    )}
                    <span className="user-name-label" style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginLeft: 4 }}>
                        {displayName}
                    </span>
                </motion.button>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            role="menu"
                            style={{
                                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                                background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 16, minWidth: 220, padding: 6,
                                boxShadow: '0 15px 30px rgba(0,0,0,0.5)', zIndex: 100
                            }}>

                            <div style={{ padding: '12px 12px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{displayName}</span>
                                    <ShieldCheck size={14} color="#10b981" />
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email}</p>
                            </div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />

                            <Link href="/profile" onClick={() => setShowProfile(false)} className="dropdown-item" role="menuitem">
                                <User size={16} /> Account
                            </Link>

                            <Link href="/settings" onClick={() => setShowProfile(false)} className="dropdown-item" role="menuitem">
                                <Settings size={16} /> Settings
                            </Link>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />

                            <div style={{ padding: '6px 12px 8px' }}>
                              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>
                                <Keyboard size={10} style={{ display: 'inline', marginRight: 4 }} />
                                Quick shortcuts
                              </p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {[['Space', 'Play'], ['M', 'Mute'], ['N', 'Next']].map(([key, label]) => (
                                  <span key={key} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                                    <strong style={{ color: '#a78bfa' }}>{key}</strong> {label}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />

                            <button onClick={() => { signOut(); setShowProfile(false) }} className="dropdown-item" role="menuitem"
                                    style={{ color: '#fb7185', marginTop: 2 }}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}
