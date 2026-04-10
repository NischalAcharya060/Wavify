import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your Wavify account password. Enter your email to receive a password reset link.',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return children
}
