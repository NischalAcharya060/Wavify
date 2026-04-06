'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, LogOut, Menu as MenuIcon } from 'lucide-react' // Added MenuIcon
import { useAuth } from '@/lib/AuthContext'

// 1. Define the Interface so TypeScript doesn't complain in AppLayout
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

    const initial = user?.email?.[0]?.toUpperCase() ?? 'U'

    return (
        <header className="navbar-container" style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '0 32px', height: 72, flexShrink: 0,
            background: 'transparent',
            zIndex: 40,
            position: 'relative'
        }}>
            <style>{`
                .nav-btn {
                  width: 34px;
                  height: 34px;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: rgba(255, 255, 255, 0.04);
                  border: none;
                  color: #fff;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                .nav-btn:hover {
                  background: rgba(255, 255, 255, 0.08);
                  transform: translateY(-1px);
                }

                /* Mobile Menu Button - Hidden on Desktop */
                .mobile-toggle {
                  display: none;
                }
                
                @media (max-width: 1024px) {
                  .mobile-toggle {
                    display: flex;
                  }
                  .navbar-container {
                    padding: 0 16px !important;
                    height: 64px !important;
                  }
                  .nav-history {
                    display: none !important;
                  }
                  .user-name-label {
                    display: none !important;
                  }
                  .profile-trigger {
                    padding: 4px !important;
                    border-radius: 50% !important;
                  }
                }
            `}</style>

            {/* 2. Mobile Toggle Button (Shows when sidebar is hidden) */}
            <button
                onClick={onMenuClick}
                className="nav-btn mobile-toggle"
                title="Open Menu"
            >
                <MenuIcon size={20} />
            </button>

            {/* Navigation History (Hidden on Mobile) */}
            <div className="nav-history" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => router.back()} className="nav-btn">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => router.forward()} className="nav-btn">
                    <ChevronRight size={20} />
                </button>
            </div>


            {/* Profile Section */}
            <div ref={dropRef} style={{ marginLeft: 'auto', position: 'relative', flexShrink: 0 }}>
                <motion.button
                    className="profile-trigger"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfile(v => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '4px 12px 4px 4px', borderRadius: 100,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)', cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                    }}>
                        {initial}
                    </div>
                    <span className="user-name-label" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.email?.split('@')[0]}
                    </span>
                </motion.button>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{
                                position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                                background: 'rgba(18, 18, 26, 0.95)', backdropFilter: 'blur(32px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 16, minWidth: 200, padding: 8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100,
                            }}>

                            <div style={{ padding: '12px 14px', marginBottom: 6 }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                    {user?.email?.split('@')[0]}
                                </p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.email}
                                </p>
                            </div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px 8px' }} />

                            <Link href="/profile" onClick={() => setShowProfile(false)}
                                  style={{
                                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                      borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)',
                                      textDecoration: 'none', transition: 'all 0.2s'
                                  }}
                                  className="profile-link-item">
                                <User size={16} /> Account
                            </Link>

                            <button onClick={() => { signOut(); setShowProfile(false) }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                        padding: '10px 12px', borderRadius: 10, fontSize: 13,
                                        color: '#fb7185', background: 'transparent', border: 'none',
                                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                        marginTop: 4
                                    }}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}