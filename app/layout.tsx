import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { PlayerProvider } from '@/lib/PlayerContext'
import Toaster from '@/components/Toaster'
import PWA from '@/components/PWA'
import MediaSession from '@/components/MediaSession'

const siteUrl = 'https://wavify.acharyanischal.com.np'
const parentDomain = 'https://acharyanischal.com.np'

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Wavify — Modern Music Streaming Platform',
        template: '%s | Wavify',
    },
    description: 'Wavify is a modern music streaming application featuring YouTube music integration. Create playlists, manage your music library, and enjoy seamless music playback with advanced player controls.',
    keywords: [
        'music streaming',
        'youtube music player',
        'playlist manager',
        'wavify',
        'music app',
        'stream music online',
        'personal music library',
        'music player',
        'audio streaming',
        'music management',
        'free music player',
        'music platform'
    ],
    authors: [{ name: 'Nischal Acharya' }],
    creator: 'Nischal Acharya',
    publisher: 'Acharya Nischal',
    category: 'Music & Audio',
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        siteName: 'Wavify',
        title: 'Wavify — Modern Music Streaming Platform',
        description: 'Stream your favorite music with Wavify. YouTube music integration, playlists, and seamless playback. Create your personal music library today.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Wavify Music Streaming Platform',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wavify — Modern Music Streaming Platform',
        description: 'Stream your favorite music with Wavify. YouTube music integration, playlists, and seamless playback.',
        images: ['/og-image.png'],
        creator: '@acharyanischal',
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
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
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    other: {
        'revisit-after': '7 days',
        'language': 'English',
        'author': 'Nischal Acharya',
        'copyright': `© 2024-${new Date().getFullYear()} Wavify Music Streaming Platform. All rights reserved.`,
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
        <html lang="en" className="dark" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="canonical" href={siteUrl} />
            <link rel="alternate" href={`${siteUrl}/`} hrefLang="en" />
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
            <meta name="color-scheme" content="dark" />
            <link rel="dns-prefetch" href={parentDomain} />
            <link rel="preconnect" href={parentDomain} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@graph': [
                            {
                                '@type': 'WebApplication',
                                '@id': `${siteUrl}/#webapp`,
                                name: 'Wavify',
                                url: siteUrl,
                                description: 'A modern music streaming platform with YouTube music integration. Create playlists, manage your library, and enjoy seamless music playback.',
                                applicationCategory: 'MultimediaApplication',
                                operatingSystem: 'Any',
                                isPartOf: {
                                    '@id': `${parentDomain}/#website`,
                                },
                                offers: {
                                    '@type': 'Offer',
                                    priceCurrency: 'USD',
                                    price: '0',
                                },
                                image: {
                                    '@type': 'ImageObject',
                                    url: `${siteUrl}/og-image.png`,
                                    width: 1200,
                                    height: 630,
                                },
                                author: {
                                    '@type': 'Person',
                                    name: 'Nischal Acharya',
                                    url: parentDomain,
                                },
                            },
                            {
                                '@type': 'WebSite',
                                '@id': `${siteUrl}/#website`,
                                name: 'Wavify',
                                description: 'Music Streaming Platform',
                                url: siteUrl,
                                potentialAction: {
                                    '@type': 'SearchAction',
                                    target: {
                                        '@type': 'EntryPoint',
                                        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
                                    },
                                    'query-input': 'required name=search_term_string',
                                },
                                isPartOf: {
                                    '@id': `${parentDomain}/#website`,
                                },
                            },
                        ],
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'Wavify',
                        url: siteUrl,
                        logo: `${siteUrl}/icons/icon.svg`,
                        description: 'Modern music streaming platform with YouTube integration',
                        parentOrganization: {
                            '@type': 'Organization',
                            name: 'Acharya Nischal',
                            url: parentDomain,
                        },
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: siteUrl,
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Parent Site',
                                item: parentDomain,
                            },
                        ],
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
                <Toaster />
                {children}
            </PlayerProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
