import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Add Song | Wavify',
    description: 'Add new songs to your Wavify library from YouTube URLs and Spotify playlists.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function AddSongLayout({ children }: { children: React.ReactNode }) {
    return children
}
