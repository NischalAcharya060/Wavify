import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Configure your Wavify music player settings and preferences.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return children
}
