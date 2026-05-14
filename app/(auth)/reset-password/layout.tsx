import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your Wavify account password. Enter your email address to receive a secure password reset link.',
    robots: {
        index: false,
        follow: true,
    },
    openGraph: {
        title: 'Reset Password | Wavify',
        description: 'Reset your Wavify account password securely',
        type: 'website',
        url: 'https://wavify.acharyanischal.com.np/reset-password',
    },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return children
}
