import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { PlayerProvider } from '@/lib/PlayerContext'
import { Toaster } from 'react-hot-toast'

const siteUrl = 'https://wavify-grdhravan.vercel.app'

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Wavify — Stream Your World',
        template: '%s | Wavify',
    },
    description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback — all in one beautiful interface.',
    keywords: ['music streaming', 'youtube music player', 'playlist manager', 'wavify', 'music app', 'stream music', 'personal music library'],
    authors: [{ name: 'Grdh Ravan' }],
    creator: 'Grdh Ravan',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        siteName: 'Wavify',
        title: 'Wavify — Stream Your World',
        description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Wavify — Stream Your World',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wavify — Stream Your World',
        description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Wavify',
    },
    manifest: '/manifest.json',
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
        <html lang="en" className="dark" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'Wavify',
                        url: siteUrl,
                        description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback.',
                        applicationCategory: 'MultimediaApplication',
                        operatingSystem: 'Any',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'USD',
                        },
                    }),
                }}
            />
        </head>
        <body suppressHydrationWarning style={{
            backgroundColor: '#08080f',
            color: '#ffffff',
            margin: 0,
            WebkitTapHighlightColor: 'transparent',
            overflowX: 'hidden'
        }}>
        <AuthProvider>
            <PlayerProvider>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1e1b4b',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '14px',
                            borderRadius: '12px',
                        },
                        duration: 3000,
                    }}
                />
                {children}
            </PlayerProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
