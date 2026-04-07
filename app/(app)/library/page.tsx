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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 4 }}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="skeleton" style={{ height: 12, width: '45%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 10, width: '22%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="skeleton" style={{ borderRadius: 18, aspectRatio: '1' }} />
}

export default function LibraryPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('songs')
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistCounts, setPlaylistCounts] = useState<Record<string, number>>({})
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
    const { data: pls } = await supabase.from('playlists').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    setPlaylists(pls || [])

    if (pls && pls.length > 0) {
      const { data: counts } = await supabase
        .from('playlist_songs')
        .select('playlist_id')
        .in('playlist_id', pls.map(p => p.id))

      const countMap: Record<string, number> = {}
      pls.forEach(p => { countMap[p.id] = 0 })
      ;(counts || []).forEach((row: any) => {
        countMap[row.playlist_id] = (countMap[row.playlist_id] || 0) + 1
      })
      setPlaylistCounts(countMap)
    }
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
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

        .pill-toggle {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px; border-radius: 14px;
          display: flex; gap: 4px; width: fit-content;
        }
        .tab-btn {
          padding: 8px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          border: none; transition: all 0.2s;
          font-family: 'Geist', sans-serif;
        }
        .control-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; overflow: hidden; display: flex;
        }
        .control-btn {
          padding: 7px 13px; font-size: 12px; font-weight: 500;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.4); transition: all 0.15s;
          font-family: 'Geist', sans-serif;
        }
        .control-btn:hover { color: rgba(255,255,255,0.75); }
        .empty-state {
          text-align: center; padding: 80px 20px;
          background: rgba(255,255,255,0.018);
          border-radius: 20px; border: 1px dashed rgba(255,255,255,0.08);
        }
        @media (max-width: 640px) {
          .lib-header { flex-direction: column !important; align-items: flex-start !important; }
          .lib-title { font-size: 34px !important; }
          .pill-toggle { width: 100%; }
          .tab-btn { flex: 1; justify-content: center; }
          .grid-pl { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="lib-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 30, gap: 16 }}>
        <div>
          <h1 className="lib-title" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 40, fontWeight: 400, color: '#f5f0ff', lineHeight: 1 }}>
            Your Library
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(160,145,200,0.45)', marginTop: 8 }}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} · {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>

        <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: 'white', border: 'none', padding: '11px 20px', borderRadius: 14, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 18px rgba(109,40,217,0.32)', fontFamily: 'Geist, sans-serif' }}>
          <Plus size={16} /> Add Track
        </motion.button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div className="pill-toggle">
          {[
            { id: 'songs', icon: Music2, label: `${songs.length} Songs` },
            { id: 'playlists', icon: ListMusic, label: `${playlists.length} Playlists` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} className="tab-btn"
              style={{
                background: tab === t.id ? 'rgba(167,139,250,0.14)' : 'transparent',
                color: tab === t.id ? '#c4a7ff' : 'rgba(160,145,200,0.5)',
                boxShadow: tab === t.id ? 'inset 0 0 0 1px rgba(167,139,250,0.22)' : 'none',
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Sort + view controls, songs only */}
        <AnimatePresence>
          {tab === 'songs' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', gap: 8 }}>
              <div className="control-pill">
                {(['created_at', 'title'] as SortKey[]).map(k => (
                  <button key={k}
                    onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortKey(k) }}
                    className="control-btn"
                    style={{ color: sortKey === k ? '#c4a7ff' : 'rgba(255,255,255,0.4)', background: sortKey === k ? 'rgba(167,139,250,0.1)' : 'transparent' }}>
                    {k === 'created_at' ? 'Date' : 'A–Z'}
                    {sortKey === k && (sortDir === 'asc' ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                ))}
              </div>
              <div className="control-pill">
                {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className="control-btn"
                    style={{ padding: '7px 12px', color: viewMode === mode ? '#c4a7ff' : 'rgba(255,255,255,0.4)', background: viewMode === mode ? 'rgba(167,139,250,0.1)' : 'transparent' }}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {tab === 'songs'
              ? <div>{[...Array(7)].map((_, i) => <SkeletonRow key={i} />)}</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            }
          </motion.div>
        ) : tab === 'songs' ? (
          <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {sortedSongs.length === 0 ? (
              <div className="empty-state">
                <Music2 size={38} strokeWidth={1.5} style={{ color: 'rgba(167,139,250,0.18)', marginBottom: 14 }} />
                <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 4 }}>Your library is empty</p>
                <p style={{ fontSize: 13, color: 'rgba(160,145,200,0.35)' }}>Add your favorite tracks to get started</p>
                <button onClick={() => setShowAddModal(true)}
                  style={{ marginTop: 20, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'Geist, sans-serif' }}>
                  <Plus size={14} /> Add your first song
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px,1fr))', gap: 14 }}>
                {sortedSongs.map((song, i) => (
                  <motion.div key={song.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}>
                    <SongCard song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="grid" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedSongs.map((song, i) => (
                  <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {playlists.length === 0 ? (
              <div className="empty-state">
                <ListMusic size={38} strokeWidth={1.5} style={{ color: 'rgba(167,139,250,0.18)', marginBottom: 14 }} />
                <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 4 }}>No playlists yet</p>
                <p style={{ fontSize: 13, color: 'rgba(160,145,200,0.35)' }}>Create one from the sidebar to organize your music</p>
              </div>
            ) : (
              <div className="grid-pl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: 16 }}>
                {playlists.map((pl, i) => (
                  <motion.div key={pl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                    <PlaylistCard playlist={pl} songCount={playlistCounts[pl.id] ?? 0} onDelete={() => deletePlaylist(pl.id)} />
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
