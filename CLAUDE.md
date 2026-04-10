# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wavify — a Spotify-like music streaming app that plays audio via YouTube. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (auth + PostgreSQL), and Zustand for state management.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (next core-web-vitals + TypeScript)
```

No test framework is configured.

## Architecture

### Route Groups (App Router)

- `app/(auth)/` — Public auth routes (login, signup). No dashboard layout.
- `app/(app)/` — Protected app routes wrapped by `AppLayout` (sidebar, navbar, player). Includes: home, library, search, liked, add-song, profile, playlist/[id].
- `app/page.tsx` — Root redirect to /home.

### State & Providers

- **AuthContext** (`lib/AuthContext.tsx`) — Supabase Auth session, wraps entire app. Handles email/password and Google OAuth.
- **PlayerContext** (`lib/PlayerContext.tsx`) — Global player state: current track, queue, shuffle, repeat, volume, sleep timer. Controls YouTube IFrame API playback.
- Root layout (`app/layout.tsx`) nests AuthProvider > PlayerProvider.

### Supabase Integration

- `lib/supabase/client.ts` — Browser-side client (for React components).
- `lib/supabase/server.ts` — Server-side client (for Server Components/Actions).
- All tables use Row-Level Security scoped to `auth.uid()`.

**Database tables:** songs, playlists, playlist_songs (junction), liked_songs, recently_played. All reference `auth.users` with CASCADE delete.

### Key Components

- **AppLayout** (`components/AppLayout.tsx`) — Assembles sidebar + navbar + player + content area.
- **MusicPlayer** (`components/MusicPlayer.tsx`) — Bottom bar player using YouTube IFrame API.
- **AddSongModal** — Accepts YouTube URL, auto-extracts video_id, title, thumbnail via `lib/youtube.ts`.

### Utilities

- `lib/youtube.ts` — YouTube URL parsing, metadata fetching, thumbnail extraction.
- `lib/types.ts` — Shared TypeScript interfaces (Song, Playlist, User, etc.).
- `lib/useDebounce.ts`, `lib/useContextMenu.ts` — Custom hooks.

## Design System

- **Dark theme** with glassmorphism: CSS custom properties defined in `app/globals.css`.
- **Fonts:** Syne (headings), DM Sans (body) — loaded via next/font.
- **Accent color:** `#7c6af7` (purple).
- **Glass effects:** `.glass`, `.glass-dark`, `.glass-player` utility classes with backdrop-blur.
- Path alias: `@/*` maps to project root.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
