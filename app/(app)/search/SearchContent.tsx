'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import { useDebounce } from '@/lib/useDebounce'
import { Search, Music2, X } from 'lucide-react'

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3.5 rounded w-2/3" />
        <div className="skeleton h-3 rounded w-1/3" />
      </div>
    </div>
  )
}

export default function SearchContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
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
    <div className="p-6">
      <h1 className="text-3xl font-black mb-6">Search</h1>

      <div className="relative mb-8 max-w-lg">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search your library…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          className="input-dark w-full pl-11 pr-10 py-3.5 rounded-2xl"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 btn-icon w-6 h-6">
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!query ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-semibold">Start typing to search</p>
            <p className="text-sm mt-1">Find songs in your library instantly</p>
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
            <Music2 size={48} className="mb-4 opacity-20" />
            <p className="font-semibold">No results for &quot;{query}&quot;</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            <div className="space-y-0.5">
              {results.map((song, i) => (
                <SongCard key={song.id} song={song} queue={results}
                  isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                  playlists={playlists} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
