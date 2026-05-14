import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home',
    description: 'Welcome to your Wavify music library. Stream, organize, and enjoy your favorite music with our modern music player.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return children
}
