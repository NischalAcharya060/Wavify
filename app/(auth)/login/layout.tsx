import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Log In | Wavify',
    description: 'Sign in to your Wavify account and access your personal music library, playlists, and liked songs. Stream music from YouTube instantly.',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'Log In to Wavify Music Streaming',
        description: 'Sign in to your Wavify account and manage your music library',
        type: 'website',
        url: 'https://wavify.acharyanischal.com.np/login',
    },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children
}
