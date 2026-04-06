import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { PlayerProvider } from '@/lib/PlayerContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'Wavify — Stream Your World',
    description: 'A modern music streaming app powered by YouTube',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Wavify',
    },
}

// Prevents the "zoom-on-focus" behavior on mobile inputs
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#08080f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body style={{
            backgroundColor: '#08080f',
            color: '#ffffff',
            margin: 0,
            WebkitTapHighlightColor: 'transparent', // Removes the blue flash on mobile taps
            overflowX: 'hidden'
        }}>
        <AuthProvider>
            <PlayerProvider>
                {/* Toaster positioned at top-center for desktop,
                but bottom-center is often better for mobile reachability.
            */}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: '#1e1b4b',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '14px',
                            borderRadius: '12px',
                        },
                    }}
                />
                {children}
            </PlayerProvider>
        </AuthProvider>
        </body>
        </html>
    )
}