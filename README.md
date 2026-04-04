# 🎵 Wavify — Spotify-like Music Streaming App

A full-stack music streaming web app built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Supabase**.

---

## ✨ Features

- 🔐 **Auth** — Sign up, login, logout via Supabase Auth
- 🎵 **YouTube Integration** — Paste a YouTube URL → auto-extracts title, thumbnail, video ID
- ▶️ **Music Player** — Fixed bottom player with progress bar, volume, skip, shuffle
- ❤️ **Liked Songs** — Like/unlike songs, dedicated Liked Songs page
- 📋 **Playlists** — Create playlists, add/remove songs
- 🕘 **Recently Played** — Tracks your listening history automatically
- 🔍 **Search** — Search across your library
- 🎨 **Dark UI** — Spotify-inspired glassmorphism design with `Syne` + `DM Sans` fonts

---

## 🚀 Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`

### 3. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: Supabase Dashboard → Settings → API

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/
  (auth)/
    login/page.tsx        # Login page
    signup/page.tsx       # Signup page
  (app)/
    layout.tsx            # Authenticated layout wrapper
    home/page.tsx         # Home dashboard
    library/page.tsx      # Songs & playlists library
    search/page.tsx       # Search
    liked/page.tsx        # Liked songs
    add-song/page.tsx     # Add YouTube song
    profile/page.tsx      # User profile & stats
    playlist/[id]/page.tsx # Playlist detail

components/
  AppLayout.tsx           # Main layout (sidebar + navbar + player)
  Sidebar.tsx             # Left sidebar with nav & playlists
  Navbar.tsx              # Top bar with search & profile
  MusicPlayer.tsx         # Bottom player (YouTube IFrame API)
  SongCard.tsx            # Reusable song row component
  PlaylistCard.tsx        # Reusable playlist grid card
  AddSongModal.tsx        # Modal for adding YouTube songs

lib/
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client
  PlayerContext.tsx       # Global music player state
  AuthContext.tsx         # Auth state & helpers
  youtube.ts              # YouTube URL parsing utilities
  types.ts                # TypeScript interfaces

supabase-schema.sql       # Full DB schema with RLS policies
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

## 🎨 Design System

- **Font**: Syne (headings) + DM Sans (body)
- **Primary**: `#6c63ff` (purple)
- **BG Base**: `#0a0a0f`
- **Glass**: `rgba(26,26,36,0.7)` with `backdrop-filter: blur(20px)`
- **Success**: `#1db954` (Spotify green)
- **Danger**: `#ff4757`

---

## 🛠 Tech Stack

- [Next.js 15](https://nextjs.org) — App Router, Server Components
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first styling
- [Supabase](https://supabase.com) — Auth + PostgreSQL database
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) — Music playback
- [Lucide React](https://lucide.dev) — Icons
