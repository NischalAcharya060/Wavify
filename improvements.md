# Wavify - Improvement Plan

## CODE QUALITY
- Add TypeScript strict mode in tsconfig.json
- Replace inline `<style>` tags with proper CSS modules or Tailwind classes
- Add React error boundaries to prevent full-app crashes
- Add loading states/skeletons for async data fetching
- Add proper JSDoc comments to utility functions

## PERFORMANCE
- Replace `<img>` tags with Next.js `<Image>` component for automatic optimization
- Add a data fetching library (SWR or TanStack Query) for caching and deduplication
- Implement memoization with useMemo/useCallback for expensive renders
- Add React.lazy() and Suspense for heavy components like AI Studio
- Consider virtualizing long lists (react-window) for playlists with many songs
- Cache YouTube metadata responses (currently fetched on every play)

## ACCESSIBILITY
- Add skip-to-content link for keyboard users
- Improve ARIA labels on interactive elements
- Add focus-visible styles for keyboard navigation
- Ensure color contrast meets WCAG AA standards
- Add alt text for all images

## SECURITY
- Move API keys from localStorage to httpOnly cookies or server-side storage
- Persist rate limiting data to database instead of in-memory (resets on restart)
- Add CSRF protection for mutations
- Validate all API inputs with Zod schemas
- Add CSP headers to prevent XSS

## USER EXPERIENCE
- Add skeleton loaders during initial page loads
- Add empty state illustrations/messages for empty playlists/library
- Add retry logic for failed network requests
- Add pagination for large datasets (playlists with 100+ songs)
- Show "last played" timestamps in recently played
- Add playlist sharing functionality
- Add "add to queue" option alongside "play now"
- Support drag-and-drop reordering in queue

## ARCHITECTURE
- Add a testing framework (Vitest or Jest) with at least unit tests
- Add E2E tests with Playwright
- Implement Zod for API request/response validation
- Add a global error toast component with retry actions
- Extract repeated AI UI into a reusable hook or component

## SEO & DISCOVERABILITY
- Add structured data (JSON-LD) for MusicPlaylist schema
- Add breadcrumb JSON-LD on all inner pages
- Add OpenGraph images for song/playlist pages
- Generate sitemap.xml entries for user playlists (dynamic)

## PWA / OFFLINE
- Add service worker for offline song playback from cache
- Implement background sync for offline playlist edits
- Add "download for offline" option per song
- Improve manifest with better icons and theme

## AI FEATURES
- Add "liked songs" to recommendation context (currently not used)
- Add streaming responses for playlist generation (better UX)
- Cache AI responses in database to avoid regenerating
- Add "search within library" for AI suggestions
- Consider adding Spotify track import by URL

## MISCELLANEOUS
- Add keyboard shortcut legend in settings
- Add "clear history" option for recently played
- Add sorting options (by date added, title, artist) for playlists
- Consider adding dark/light mode toggle (currently only dark)
- Add audio crossfade option between tracks
- Consider adding equalizer/ audio effects