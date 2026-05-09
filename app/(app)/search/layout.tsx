import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Search | Wavify',
    description: 'Search for your favorite music, artists, and playlists in Wavify.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return children
}
