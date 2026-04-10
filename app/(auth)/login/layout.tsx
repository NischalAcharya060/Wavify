import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Log In',
    description: 'Sign in to Wavify and access your personal music library, playlists, and liked songs.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children
}
