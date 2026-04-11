# 🎵 Wavify — Spotify-like Music Streaming App

A full-stack music streaming web app built with **Next.js 16 (App Router)**, **Tailwind CSS**, **Supabase**, and **Google Gemini AI**.

---

## ✨ Features

- 🔐 **Auth** — Sign up, login, logout via Supabase Auth (email/password + Google OAuth)
- 🎵 **YouTube Integration** — Paste a YouTube URL → auto-extracts title, thumbnail, video ID
- ▶️ **Music Player** — Fixed bottom player with progress bar, volume, skip, shuffle, repeat, sleep timer
- ❤️ **Liked Songs** — Like/unlike songs, dedicated Liked Songs page
- 📋 **Playlists** — Create playlists, add/remove songs
- 🕘 **Recently Played** — Tracks your listening history automatically
- 🔍 **Search** — Search across your library
- 🎨 **Dark UI** — Spotify-inspired glassmorphism design with `Syne` + `DM Sans` fonts

### 🤖 AI Features (Powered by Google Gemini)

- ✨ **Smart Recommendations** — AI analyzes your library, liked songs, and listening history to suggest new music
- 🎶 **AI Playlist Generator** — Describe a mood or vibe (e.g., "chill study vibes") and AI curates a playlist from your library + suggests new songs
- 🧠 **Mood Analysis** — AI tags your songs with mood, energy level (1-10), genres, and vibe descriptions
- ⚡ **Built-in Rate Limiting** — Per-user rate limits (8 req/min, 200 req/day) to stay within Gemini free tier quotas

---

## 🚀 Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`

### 3. Get a Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Free tier includes: 10 requests/min, 250 requests/day for Gemini 2.5 Flash

### 4. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

Find Supabase keys in: Supabase Dashboard → Settings → API

### 5. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/
  (auth)/
    login/page.tsx            # Login page
    signup/page.tsx           # Signup page
  (app)/
    layout.tsx                # Authenticated layout wrapper
    home/page.tsx             # Home dashboard
    library/page.tsx          # Songs & playlists library
    search/page.tsx           # Search
    liked/page.tsx            # Liked songs
    add-song/page.tsx         # Add YouTube song
    ai/page.tsx               # AI Studio (recommendations, playlist gen, mood analysis)
    profile/page.tsx          # User profile & stats
    playlist/[id]/page.tsx    # Playlist detail
  api/
    ai/
      recommend/route.ts      # AI song recommendations endpoint
      generate-playlist/route.ts  # AI playlist generation endpoint
      analyze/route.ts        # AI mood analysis endpoint

components/
  AppLayout.tsx               # Main layout (sidebar + navbar + player)
  Sidebar.tsx                 # Left sidebar with nav & playlists
  Navbar.tsx                  # Top bar with search & profile
  MusicPlayer.tsx             # Bottom player (YouTube IFrame API)
  SongCard.tsx                # Reusable song row component
  PlaylistCard.tsx            # Reusable playlist grid card
  AddSongModal.tsx            # Modal for adding YouTube songs

lib/
  supabase/
    client.ts                 # Browser Supabase client
    server.ts                 # Server Supabase client
  gemini.ts                   # Google Gemini AI client, JSON parser, rate limiter
  PlayerContext.tsx            # Global music player state
  AuthContext.tsx              # Auth state & helpers
  youtube.ts                  # YouTube URL parsing utilities
  types.ts                    # TypeScript interfaces

supabase-schema.sql           # Full DB schema with RLS policies
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `songs` | YouTube songs saved by users |
| `playlists` | User-created playlists |
| `playlist_songs` | Many-to-many songs ↔ playlists |
| `liked_songs` | User likes |
| `recently_played` | Listening history |

All tables have **Row Level Security** enabled so users only see their own data.

---

## 🤖 AI Architecture

All AI features use server-side API routes (`app/api/ai/`) to keep the Gemini API key secure. The flow:

1. Client sends request to `/api/ai/*`
2. Route authenticates user via Supabase session cookies
3. Rate limiter checks per-user limits (8/min, 200/day)
4. User's song data is fetched from Supabase and sent as context to Gemini
5. Gemini 2.5 Flash responds with structured JSON
6. Response is parsed and returned to the client

**Rate Limits (Gemini 2.5 Flash Free Tier):**
| Limit | Gemini Limit | App Limit (safety margin) |
|-------|-------------|--------------------------|
| Requests/min | 10 | 8 |
| Requests/day | 250 | 200 |

---

## 🎨 Design System

- **Font**: Syne (headings) + DM Sans (body)
- **Primary**: `#7c6af7` (purple)
- **BG Base**: `#08080f`
- **Glass**: `rgba(26,26,36,0.7)` with `backdrop-filter: blur(20px)`
- **Success**: `#34d399`
- **Danger**: `#fb7185`

---

## 🛠 Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components
- [React 19](https://react.dev) — UI framework
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first styling
- [Supabase](https://supabase.com) — Auth + PostgreSQL database
- [Google Gemini AI](https://ai.google.dev) — AI-powered music features (2.5 Flash)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) — Music playback
- [Framer Motion](https://motion.dev) — Animations
- [Lucide React](https://lucide.dev) — Icons
- [Zustand](https://zustand.docs.pmnd.rs) — State management
