'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Google Identity Services types are not in lib.dom; minimal shape we use.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            nonce?: string
            use_fedcm_for_prompt?: boolean
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            itp_support?: boolean
            context?: 'signin' | 'signup' | 'use'
          }) => void
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean
              isSkippedMoment: () => boolean
              getNotDisplayedReason: () => string
              getSkippedReason: () => string
            }) => void
          ) => void
          cancel: () => void
        }
      }
    }
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client'

async function sha256(input: string) {
  const buf = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomNonce() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function GoogleOneTap({ context = 'signin' }: { context?: 'signin' | 'signup' | 'use' }) {
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return
    if (initialized.current) return

    const supabase = createClient()
    let cancelled = false

    const init = async () => {
      // Skip if already signed in — avoids prompting on top of an active session.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return

      // Supabase requires the hashed nonce in the ID token's `nonce` claim
      // and the raw nonce passed to signInWithIdToken for verification.
      const rawNonce = randomNonce()
      const hashedNonce = await sha256(rawNonce)

      const start = () => {
        if (cancelled || !window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          itp_support: true,
          auto_select: false,
          cancel_on_tap_outside: true,
          context,
          callback: async ({ credential }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential,
              nonce: rawNonce,
            })
            if (error) {
              console.error('[GoogleOneTap] signInWithIdToken failed:', error.message)
              return
            }
            router.push('/home')
            router.refresh()
          },
        })
        window.google.accounts.id.prompt()
        initialized.current = true
      }

      if (window.google?.accounts?.id) {
        start()
        return
      }

      // Load GIS script once.
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
      if (existing) {
        existing.addEventListener('load', start, { once: true })
        return
      }
      const script = document.createElement('script')
      script.src = GIS_SRC
      script.async = true
      script.defer = true
      script.onload = start
      document.head.appendChild(script)
    }

    init()

    return () => {
      cancelled = true
      window.google?.accounts.id.cancel()
    }
  }, [router, context])

  return null
}
