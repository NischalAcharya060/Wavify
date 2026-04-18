'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'wavify:pwa-install-dismissed'

export default function PWA() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
    const [visible, setVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Register the service worker
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!('serviceWorker' in navigator)) return
        if (process.env.NODE_ENV !== 'production') return

        const register = () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {})
        }

        if (document.readyState === 'complete') register()
        else window.addEventListener('load', register, { once: true })
    }, [])

    // Capture the install prompt
    useEffect(() => {
        if (typeof window === 'undefined') return

        const onBeforeInstall = (e: Event) => {
            e.preventDefault()
            const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
            const oneWeek = 7 * 24 * 60 * 60 * 1000
            if (dismissedAt && Date.now() - dismissedAt < oneWeek) return
            setDeferred(e as BeforeInstallPromptEvent)
            setVisible(true)
        }

        const onInstalled = () => {
            setDeferred(null)
            setVisible(false)
        }

        window.addEventListener('beforeinstallprompt', onBeforeInstall)
        window.addEventListener('appinstalled', onInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    const install = async () => {
        if (!deferred) return
        await deferred.prompt()
        await deferred.userChoice
        setDeferred(null)
        setVisible(false)
    }

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, String(Date.now()))
        setVisible(false)
    }

    // Mobile: slide up from bottom full-width card
    // Desktop: bottom-right floating toast
    const mobileStyle: React.CSSProperties = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        width: '100%',
        background: 'rgba(14, 12, 30, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
    }

    const desktopStyle: React.CSSProperties = {
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 10000,
        width: '360px',
        background: 'rgba(20, 18, 40, 0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }

    return (
        <AnimatePresence>
            {visible && deferred && (
                <motion.div
                    initial={{ opacity: 0, y: isMobile ? 100 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: isMobile ? 100 : 24 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    style={isMobile ? mobileStyle : desktopStyle}
                >
                    {isMobile ? (
                        // ── Mobile Layout ──
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        background: 'linear-gradient(135deg, #7c6af7, #3b2fa8)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Download size={22} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Install Wavify</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Free • Works offline</div>
                                    </div>
                                </div>
                                <button
                                    aria-label="Dismiss"
                                    onClick={dismiss}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 32, height: 32,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.5 }}>
                                Add to your home screen for a full-screen music experience — no browser UI.
                            </div>
                            <button
                                onClick={install}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #7c6af7, #3b2fa8)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    letterSpacing: 0.3,
                                }}
                            >
                                Add to Home Screen
                            </button>
                        </div>
                    ) : (
                        // ── Desktop Layout ──
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: 'linear-gradient(135deg, #7c6af7, #3b2fa8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Download size={20} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Install Wavify</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
                                    Add to home screen for a full-app experience.
                                </div>
                            </div>
                            <button
                                onClick={install}
                                style={{
                                    background: '#7c6af7',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                Install
                            </button>
                            <button
                                aria-label="Dismiss"
                                onClick={dismiss}
                                style={{
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.45)',
                                    border: 'none',
                                    padding: 4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}