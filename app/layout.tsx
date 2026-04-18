import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { PlayerProvider } from '@/lib/PlayerContext'
import { Toaster } from 'react-hot-toast'
import PWA from '@/components/PWA'
import MediaSession from '@/components/MediaSession'

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
            <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
            <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
            <meta name="application-name" content="Wavify" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-title" content="Wavify" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="msapplication-TileColor" content="#08080f" />
            <meta name="msapplication-tap-highlight" content="no" />
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
                <MediaSession />
                <PWA />
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
