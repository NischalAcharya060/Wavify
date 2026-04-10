import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Wavify — Stream Your World',
    description: 'A modern personal music streaming app. Sync your favorite YouTube tracks, create playlists, and enjoy seamless playback — all in one beautiful interface.',
    alternates: {
        canonical: 'https://wavify-grdhravan.vercel.app',
    },
}

export default function RootPage() {
    redirect('/home')
}