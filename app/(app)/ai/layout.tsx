import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AI Music Assistant',
    description: 'Get AI-powered music recommendations and playlist generation. Let our AI assistant help you discover new music tailored to your taste.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function AILayout({ children }: { children: React.ReactNode }) {
    return children
}
