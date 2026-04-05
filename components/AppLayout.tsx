'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import MusicPlayer from '@/components/MusicPlayer'
import { Toaster } from 'react-hot-toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        if (!loading && !user) router.replace('/login')
    }, [user, loading, router])

    if (loading) return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#08080f',
            fontFamily: 'Geist, sans-serif'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: '2px solid rgba(124, 58, 237, 0.1)',
                        borderTopColor: '#7c3aed',
                        boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)'
                    }}
                />
                <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Tuning in...
                </p>
            </div>
        </div>
    )

    if (!user) return null

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: '#08080f', // Base dark background
            color: '#f0f0f8'
        }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Subtle background glow */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '40%',
                    background: 'radial-gradient(circle at 70% 0%, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <Navbar />

                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    zIndex: 1
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="page-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <MusicPlayer />
            </div>

            <Toaster
                position="bottom-right"
                containerStyle={{ bottom: 110, right: 24 }}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(18, 18, 26, 0.8)',
                        backdropFilter: 'blur(12px)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontFamily: "Geist, sans-serif",
                        fontSize: '14px',
                        fontWeight: 500,
                        borderRadius: '16px',
                        padding: '12px 20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#7c3aed',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <style>{`
        /* Global scrollbar styling for the new aesthetic */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    )
}