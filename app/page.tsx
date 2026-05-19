import type { Metadata } from 'next'
import Link from 'next/link'
import LandingClient from '@/components/Landing/LandingClient'

const siteUrl = 'https://wavify.acharyanischal.com.np'

export const metadata: Metadata = {
    title: 'Wavify — Stream Your World',
    description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback — all in one beautiful interface.',
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: 'Wavify — Stream Your World',
        description: 'Stream YouTube music, build playlists, and enjoy a beautiful player. Sign up free.',
        url: siteUrl,
        type: 'website',
    },
}

export default function LandingPage() {
    return (
        <>
            <LandingClient />
            {/* No-JS fallback — content is server-rendered so crawlers / pre-JS users
                still see the hero + CTAs and can navigate. */}
            <noscript>
                <div style={{ padding: 24, textAlign: 'center', color: '#eee' }}>
                    <h1>Wavify — Stream Your World</h1>
                    <p>A modern personal music streaming app.</p>
                    <Link href="/signup">Get Started</Link> · <Link href="/login">Sign In</Link>
                </div>
            </noscript>
        </>
    )
}
