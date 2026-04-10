import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create a free Wavify account. Sync your favorite YouTube music, build playlists, and stream anywhere.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children
}
