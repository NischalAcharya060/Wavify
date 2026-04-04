'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import PlaylistCard from '@/components/PlaylistCard'
import AddSongModal from '@/components/AddSongModal'
import toast from 'react-hot-toast'
import { Plus, Music2, ListMusic, LayoutGrid, List, SortAsc, SortDesc } from 'lucide-react'

type Tab = 'songs' | 'playlists'
type SortKey = 'created_at' | 'title'
type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'grid'

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

export default function LibraryPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('songs')
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const supabase = createClient()

  useEffect(() => { if (user) fetchAll() }, [user])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchSongs(), fetchPlaylists(), fetchLiked()])
    setLoading(false)
  }

  const fetchSongs = async () => {
    const { data } = await supabase.from('songs').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    setSongs(data || [])
  }

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    setPlaylists(data || [])
  }

  const fetchLiked = async () => {
    const { data } = await supabase.from('liked_songs').select('song_id').eq('user_id', user!.id)
    setLikedIds(new Set((data || []).map((l: any) => l.song_id)))
  }

  const deletePlaylist = async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id)
    toast.success('Playlist deleted')
    fetchPlaylists()
  }

  const deleteSong = async (id: string) => {
    await supabase.from('songs').delete().eq('id', id)
    toast.success('Song deleted')
    fetchSongs()
  }

  const sortedSongs = [...songs].sort((a, b) => {
    const v = sortKey === 'title'
      ? a.title.localeCompare(b.title)
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortDir === 'asc' ? v : -v
  })

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Your Library</h1>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={15} /> Add Song
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: 'var(--bg-elevated)' }}>
        {([
          ['songs', Music2, `${songs.length} Songs`],
          ['playlists', ListMusic, `${playlists.length} Playlists`],
        ] as const).map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === key
              ? { background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white' }
              : { color: 'var(--text-secondary)' }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Sort + view controls (songs tab only) */}
      <AnimatePresence>
        {tab === 'songs' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center rounded-lg overflow-hidden text-xs"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {(['created_at', 'title'] as SortKey[]).map(k => (
                <button key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortKey(k) }}
                  className="px-3 py-1.5 font-medium flex items-center gap-1 transition-colors"
                  style={{ color: sortKey === k ? 'var(--accent)' : 'var(--text-muted)', background: sortKey === k ? 'rgba(124,106,247,0.12)' : 'transparent' }}>
                  {k === 'created_at' ? 'Date' : 'A–Z'}
                  {sortKey === k && (sortDir === 'asc' ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-lg overflow-hidden"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-2 transition-colors"
                  style={{ color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)', background: viewMode === mode ? 'rgba(124,106,247,0.12)' : 'transparent' }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <p className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
              {sortedSongs.length} songs
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-1">
            {[...Array(7)].map((_, i) => <SkeletonRow key={i} />)}
          </motion.div>
        ) : tab === 'songs' ? (
          <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {sortedSongs.length === 0 ? (
              <div className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
                <Music2 size={40} className="mb-4 opacity-30" />
                <p className="font-semibold mb-2">No songs yet</p>
                <button onClick={() => setShowAddModal(true)}
                  className="btn-primary px-5 py-2 rounded-xl text-sm">Add your first song</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedSongs.map((song, i) => (
                  <motion.div key={song.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}>
                    <SongCard song={song} queue={sortedSongs}
                      isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                      showDelete onDelete={() => deleteSong(song.id)}
                      playlists={playlists} index={i} view="grid" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {sortedSongs.map((song, i) => (
                  <SongCard key={song.id} song={song} queue={sortedSongs}
                    isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                    showDelete onDelete={() => deleteSong(song.id)}
                    playlists={playlists} index={i} view="list" />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {playlists.length === 0 ? (
              <div className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
                <ListMusic size={40} className="mb-4 opacity-30" />
                <p className="font-semibold">No playlists yet</p>
                <p className="text-sm mt-1">Create one from the sidebar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.map((pl, i) => (
                  <motion.div key={pl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}>
                    <PlaylistCard playlist={pl} onDelete={() => deletePlaylist(pl.id)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && <AddSongModal onClose={() => setShowAddModal(false)} onAdded={fetchAll} />}
      </AnimatePresence>
    </div>
  )
}
