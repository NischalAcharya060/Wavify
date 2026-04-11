import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GOOGLE_GEMINI_API_KEY
    if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not set')
    genAI = new GoogleGenerativeAI(key)
  }
  return genAI
}

export function getModel(modelName = 'gemini-2.5-flash') {
  return getGeminiClient().getGenerativeModel({ model: modelName })
}

export function parseGeminiJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

// --- Rate Limiter ---
// Gemini 2.5 Flash free tier: 10 RPM, 250 RPD
// We enforce per-user limits slightly below to stay safe

interface RateBucket {
  minuteTimestamps: number[]
  dayTimestamps: number[]
}

const userBuckets = new Map<string, RateBucket>()

const RATE_LIMIT = {
  maxPerMinute: 8,   // 10 RPM limit, we use 8 to stay safe
  maxPerDay: 200,    // 250 RPD limit, we use 200 to stay safe
}

function getBucket(userId: string): RateBucket {
  if (!userBuckets.has(userId)) {
    userBuckets.set(userId, { minuteTimestamps: [], dayTimestamps: [] })
  }
  return userBuckets.get(userId)!
}

function pruneTimestamps(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs
  return timestamps.filter(t => t > cutoff)
}

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number; message?: string } {
  const bucket = getBucket(userId)

  // Prune old timestamps
  bucket.minuteTimestamps = pruneTimestamps(bucket.minuteTimestamps, 60_000)
  bucket.dayTimestamps = pruneTimestamps(bucket.dayTimestamps, 86_400_000)

  // Check per-minute
  if (bucket.minuteTimestamps.length >= RATE_LIMIT.maxPerMinute) {
    const oldestInWindow = bucket.minuteTimestamps[0]
    const retryAfter = Math.ceil((oldestInWindow + 60_000 - Date.now()) / 1000)
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      message: `Too many requests. Please wait ${retryAfter}s (limit: ${RATE_LIMIT.maxPerMinute}/min)`,
    }
  }

  // Check per-day
  if (bucket.dayTimestamps.length >= RATE_LIMIT.maxPerDay) {
    return {
      allowed: false,
      message: `Daily AI limit reached (${RATE_LIMIT.maxPerDay} requests). Resets at midnight PT.`,
    }
  }

  return { allowed: true }
}

export function recordRequest(userId: string) {
  const bucket = getBucket(userId)
  const now = Date.now()
  bucket.minuteTimestamps.push(now)
  bucket.dayTimestamps.push(now)
}
