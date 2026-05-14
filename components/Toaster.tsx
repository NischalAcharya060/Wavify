'use client'

import { Toaster as ReactHotToaster } from 'react-hot-toast'

export default function Toaster() {
    return (
        <ReactHotToaster
            position="bottom-right"
            reverseOrder={false}
            gutter={16}
            containerStyle={{
                bottom: 28,
                right: 28,
            }}
            toastOptions={{
                duration: 4000,

                style: {
                    background: `
                        linear-gradient(
                            135deg,
                            rgba(15,15,24,0.88),
                            rgba(24,24,38,0.82),
                            rgba(38,38,60,0.72)
                        )
                    `,

                    backdropFilter: 'blur(28px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(180%)',

                    color: '#f8fafc',

                    border: '1px solid rgba(255,255,255,0.08)',

                    borderRadius: '24px',

                    padding: '18px 20px',

                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '1.5',

                    letterSpacing: '-0.015em',

                    minWidth: '340px',
                    maxWidth: '420px',

                    fontFamily: "'DM Sans', sans-serif",

                    boxShadow: `
                        0 0 0 1px rgba(255,255,255,0.03),
                        0 10px 30px rgba(0,0,0,0.35),
                        0 30px 80px rgba(124,58,237,0.18),
                        inset 0 1px 0 rgba(255,255,255,0.06),
                        inset 0 -1px 0 rgba(255,255,255,0.02)
                    `,

                    position: 'relative',
                    overflow: 'hidden',
                },

                success: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#0b0b12',
                    },

                    style: {
                        border:
                            '1px solid rgba(34,197,94,0.18)',

                        boxShadow: `
                            0 0 0 1px rgba(34,197,94,0.06),
                            0 10px 40px rgba(34,197,94,0.16),
                            0 30px 80px rgba(34,197,94,0.12),
                            inset 0 1px 0 rgba(255,255,255,0.04)
                        `,
                    },
                },

                error: {
                    iconTheme: {
                        primary: '#f43f5e',
                        secondary: '#0b0b12',
                    },

                    style: {
                        border:
                            '1px solid rgba(244,63,94,0.18)',

                        boxShadow: `
                            0 0 0 1px rgba(244,63,94,0.05),
                            0 10px 40px rgba(244,63,94,0.16),
                            0 30px 80px rgba(244,63,94,0.10),
                            inset 0 1px 0 rgba(255,255,255,0.04)
                        `,
                    },
                },

                loading: {
                    duration: Infinity,

                    iconTheme: {
                        primary: '#8b5cf6',
                        secondary: '#0b0b12',
                    },

                    style: {
                        border:
                            '1px solid rgba(139,92,246,0.18)',

                        boxShadow: `
                            0 0 0 1px rgba(139,92,246,0.05),
                            0 10px 40px rgba(139,92,246,0.16),
                            0 30px 80px rgba(139,92,246,0.18),
                            inset 0 1px 0 rgba(255,255,255,0.04)
                        `,
                    },
                },
            }}
        />
    )
}