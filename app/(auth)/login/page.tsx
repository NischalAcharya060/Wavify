'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AuthPage, Spinner, GoogleIcon, EmailIcon, LockIcon, Divider, InputField, AuthLink } from '@/components/AuthLayout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/home')
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } })
  }

  return (
    <AuthPage title="Welcome Back" subtitle="Sign in to continue to your music">
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="social-btn"
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </button>

      <Divider />

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<EmailIcon />}
          focused={focusedField === 'email'}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<LockIcon />}
          focused={focusedField === 'password'}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href="/reset-password" style={{ fontSize: 13, color: 'rgba(167,139,250,0.6)', textDecoration: 'none' }}>
          Forgot your password?
        </Link>
      </div>

      <AuthLink text="Don't have an account?" linkText="Create one" href="/signup" />
    </AuthPage>
  )
}