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

    // Register the service worker
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!('serviceWorker' in navigator)) return
        if (process.env.NODE_ENV !== 'production') return

        const register = () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Swallow errors — SW registration is a progressive enhancement
            })
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

    return (
        <AnimatePresence>
            {visible && deferred && (
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    style={{
                        position: 'fixed',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 104px)',
                        zIndex: 10000,
                        width: 'min(92vw, 420px)',
                        background: 'rgba(20, 18, 40, 0.85)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                        padding: '14px 16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #7c6af7, #3b2fa8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Download size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Install Wavify</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.35 }}>
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
                            color: 'rgba(255,255,255,0.55)',
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
                </motion.div>
            )}
        </AnimatePresence>
    )
}
