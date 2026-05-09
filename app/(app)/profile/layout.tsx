import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profile | Wavify',
    description: 'Manage your Wavify account settings and profile information.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return children
}
