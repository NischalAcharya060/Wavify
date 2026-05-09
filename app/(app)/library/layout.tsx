import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My Library | Wavify',
    description: 'Access your music library, playlists, and recently played songs. Manage your collection in Wavify.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
    return children
}
