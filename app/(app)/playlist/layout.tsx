import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Playlist | Wavify',
    description: 'Create, manage, and share your custom music playlists on Wavify.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function PlaylistLayout({ children }: { children: React.ReactNode }) {
    return children
}
