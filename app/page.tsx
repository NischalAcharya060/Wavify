import { redirect } from 'next/navigation'

/**
 * Root Redirect
 * This ensures that when a user lands on the base URL (e.g., wavify.com/),
 * they are immediately sent to the main dashboard.
 */
export default function RootPage() {
    redirect('/home')
}