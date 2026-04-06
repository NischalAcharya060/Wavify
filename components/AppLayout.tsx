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

    // Default to collapsed (true) so it doesn't "flash" open on mobile load
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        if (!loading && !user) router.replace('/login')

        const handleResizing = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            // On desktop, we usually want it open (not collapsed)
            if (!mobile) setSidebarCollapsed(false)
            // On mobile, we usually want it closed (collapsed)
            else setSidebarCollapsed(true)
        }

        handleResizing()
        window.addEventListener('resize', handleResizing)
        return () => window.removeEventListener('resize', handleResizing)
    }, [user, loading, router])

    if (loading) return null

    return (
        <div className="app-container" style={{
            display: 'flex', height: '100vh', width: '100vw',
            overflow: 'hidden', background: '#08080f', color: '#f0f0f8'
        }}>
            <style>{`
                .sidebar-wrapper { 
                    height: 100vh;
                    z-index: 1000;
                    background: #08080f;
                    transition: transform 0.3s ease, width 0.3s ease;
                }

                .main-viewport {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    height: 100vh;
                    position: relative;
                }

                .content-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding-bottom: 100px;
                }

                @media (max-width: 1024px) {
                    .sidebar-wrapper {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 280px !important;
                        transform: translateX(${sidebarCollapsed ? '-100%' : '0'});
                    }
                }
            `}</style>

            {/* Background Overlay for Mobile */}
            <AnimatePresence>
                {isMobile && !sidebarCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarCollapsed(true)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 950
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="sidebar-wrapper">
                <Sidebar
                    // Force the sidebar to show content when it's slide-out on mobile
                    collapsed={isMobile ? false : sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            <div className="main-viewport">
                <Navbar onMenuClick={() => setSidebarCollapsed(false)} />
                <main className="content-scroll-area">
                    {children}
                </main>
                <MusicPlayer isCollapsed={sidebarCollapsed} />
            </div>

            <Toaster position="bottom-right" />
        </div>
    )
}