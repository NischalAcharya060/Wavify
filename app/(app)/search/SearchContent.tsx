'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import { useDebounce } from '@/lib/useDebounce'
import { Search, Music2, X, SearchIcon } from 'lucide-react'

function SkeletonRow() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
                <div className="skeleton" style={{ height: 10, width: '20%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
            </div>
        </div>
    )
}

function SearchContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const debouncedQuery = useDebounce(query, 300)
    const [results, setResults] = useState<Song[]>([])
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const supabase = createClient()

    useEffect(() => { if (user) { fetchPlaylists(); fetchLiked() } }, [user])

    useEffect(() => {
        if (debouncedQuery && user) doSearch(debouncedQuery)
        else setResults([])
    }, [debouncedQuery, user])

    const doSearch = async (q: string) => {
        setLoading(true)
        const { data } = await supabase.from('songs').select('*')
            .eq('user_id', user!.id).ilike('title', `%${q}%`)
            .order('created_at', { ascending: false })
        setResults(data || [])
        setLoading(false)
    }

    const fetchPlaylists = async () => {
        const { data } = await supabase.from('playlists').select('*').eq('user_id', user!.id)
        setPlaylists(data || [])
    }
    const fetchLiked = async () => {
        const { data } = await supabase.from('liked_songs').select('song_id').eq('user_id', user!.id)
        setLikedIds(new Set((data || []).map((l: any) => l.song_id)))
    }

    return (
        <div className="search-page-wrapper" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .search-container {
          position: relative;
          max-width: 600px;
          margin-bottom: 40px;
        }

        .search-input {
          width: 100%;
          height: 54px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          padding: 0 50px 0 54px;
          color: #f0f0f8;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .search-input:focus {
          background: rgba(167, 139, 250, 0.05);
          border-color: rgba(167, 139, 250, 0.5);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          color: rgba(160, 145, 200, 0.4);
          text-align: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 640px) {
          .search-page-wrapper {
            padding: 24px 16px !important;
          }
          .search-title {
            font-size: 32px !important;
          }
          .search-container {
            margin-bottom: 24px;
          }
          .search-input {
            height: 48px;
            font-size: 14px;
            padding: 0 44px 0 48px;
          }
          .empty-state {
            padding: 40px 0;
          }
        }
      `}</style>

            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <h1 className="search-title" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 42, fontWeight: 400, color: '#f5f0ff', lineHeight: 1, marginBottom: 8 }}>
                    Search
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)' }}>
                    Explore your personal library
                </p>
            </header>

            {/* Search Bar */}
            <div className="search-container">
                <SearchIcon
                    size={18}
                    style={{
                        position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                        color: isFocused ? '#a78bfa' : 'rgba(160,145,200,0.4)',
                        transition: 'color 0.2s'
                    }}
                />
                <input
                    type="text"
                    placeholder="Search by song title..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus
                    className="search-input"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]) }}
                        style={{
                            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%',
                            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'rgba(255,255,255,0.6)'
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
                {!query ? (
                    <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="empty-state">
                        <div style={{ padding: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', marginBottom: 20 }}>
                            <Search size={40} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500 }}>Find your music</h3>
                        <p style={{ fontSize: 14, marginTop: 4 }}>Search for tracks in your synced library</p>
                    </motion.div>
                ) : loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                    </motion.div>
                ) : results.length === 0 ? (
                    <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <Music2 size={40} strokeWidth={1.5} style={{ marginBottom: 20 }} />
                        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500 }}>No results for "{query}"</h3>
                        <p style={{ fontSize: 14, marginTop: 4 }}>Try a different title or keyword</p>
                    </motion.div>
                ) : (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p style={{ fontSize: 13, color: 'rgba(160,145,200,0.5)', marginBottom: 20, fontWeight: 500 }}>
                            Found {results.length} result{results.length !== 1 ? 's' : ''}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {results.map((song, i) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    queue={results}
                                    isLiked={likedIds.has(song.id)}
                                    onLikeToggle={fetchLiked}
                                    playlists={playlists}
                                    index={i}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="px-4 py-6 md:p-8 text-white/20">Loading...</div>}>
            <SearchContent />
        </Suspense>
    )
}