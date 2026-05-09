import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Liked Songs | Wavify',
    description: 'Your collection of liked and favorite songs in Wavify.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function LikedLayout({ children }: { children: React.ReactNode }) {
    return children
}
