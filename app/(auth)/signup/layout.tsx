import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign Up | Wavify',
    description: 'Create a free Wavify account today. Sync your favorite YouTube music, build custom playlists, and stream anywhere with our modern music streaming platform.',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'Join Wavify - Free Music Streaming',
        description: 'Create your free account and start streaming music with YouTube integration',
        type: 'website',
        url: 'https://wavify.acharyanischal.com.np/signup',
    },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children
}
