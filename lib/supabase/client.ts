import { createBrowserClient } from '@supabase/ssr'

// Optimize: Reuse the same client instance
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}

// Optimized query with better caching
export async function fetchFromSupabase<T>(query: () => Promise<{ data: T | null; error: Error | null }>, ttl = 60 * 5) {
  const cacheKey = `supabase_${JSON.stringify(query)}`
  const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null

  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < ttl * 1000) {
      return { data, error: null }
    }
  }

  const { data, error } = await query()

  if (!error && typeof window !== 'undefined') {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
  }

  return { data, error }
}