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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
                <div className="skeleton" style={{ height: 10, width: '20%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
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
        <div className="library-container" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .pill-toggle {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px;
          border-radius: 14px;
          display: flex;
          gap: 4px;
          width: fit-content;
        }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
        }

        .control-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
        }

        .control-btn {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          color: rgba(255,255,255,0.4);
        }

        @media (max-width: 768px) {
          .library-container { padding: 24px 16px !important; }
          .library-header { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 20px !important; 
          }
          .library-title { font-size: 34px !important; }
          .add-btn { width: 100%; justify-content: center; height: 48px; }
          .pill-toggle { width: 100%; }
          .tab-btn { flex: 1; justify-content: center; }
          
          .grid-layout {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 12px !important;
          }
        }
      `}</style>

            {/* Header */}
            <header className="library-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
                <div>
                    <h1 className="library-title" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 42, fontWeight: 400, color: '#f5f0ff', lineHeight: 1 }}>
                        Your Library
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)', marginTop: 8 }}>
                        Manage your songs and curated playlists
                    </p>
                </div>
                <motion.button
                    className="add-btn"
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        color: 'white', border: 'none', padding: '12px 20px',
                        borderRadius: 14, fontSize: 14, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 15px rgba(109, 40, 217, 0.3)'
                    }}>
                    <Plus size={18} /> Add Track
                </motion.button>
            </header>

            {/* Navigation Tabs */}
            <div className="pill-toggle" style={{ marginBottom: 24 }}>
                {[
                    { id: 'songs', icon: Music2, label: `${songs.length} Songs` },
                    { id: 'playlists', icon: ListMusic, label: `${playlists.length} Playlists` },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as Tab)}
                        className="tab-btn"
                        style={{
                            background: tab === t.id ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                            color: tab === t.id ? '#c4a7ff' : 'rgba(160,145,200,0.5)',
                            boxShadow: tab === t.id ? 'inset 0 0 0 1px rgba(167, 139, 250, 0.2)' : 'none'
                        }}
                    >
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Sorting & View Controls */}
            <AnimatePresence>
                {tab === 'songs' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
                    >
                        <div className="control-pill">
                            {(['created_at', 'title'] as SortKey[]).map(k => (
                                <button
                                    key={k}
                                    onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortKey(k) }}
                                    className="control-btn"
                                    style={{
                                        color: sortKey === k ? '#c4a7ff' : 'rgba(255,255,255,0.4)',
                                        background: sortKey === k ? 'rgba(167,139,250,0.1)' : 'transparent'
                                    }}
                                >
                                    {k === 'created_at' ? 'Date' : 'A–Z'}
                                    {sortKey === k && (sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                                </button>
                            ))}
                        </div>

                        <div className="control-pill">
                            {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className="control-btn"
                                    style={{
                                        padding: '8px 12px',
                                        color: viewMode === mode ? '#c4a7ff' : 'rgba(255,255,255,0.4)',
                                        background: viewMode === mode ? 'rgba(167,139,250,0.1)' : 'transparent'
                                    }}
                                >
                                    <Icon size={16} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        {[...Array(7)].map((_, i) => <SkeletonRow key={i} />)}
                    </motion.div>
                ) : tab === 'songs' ? (
                    <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {sortedSongs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(160,145,200,0.4)' }}>
                                <Music2 size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                                <p style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Your library is empty</p>
                                <p style={{ fontSize: 13, marginTop: 4 }}>Add your favorite tracks to get started</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                                {sortedSongs.map((song, i) => (
                                    <motion.div key={song.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}>
                                        <SongCard song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="grid" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {sortedSongs.map((song, i) => (
                                    <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="list" />
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {playlists.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(160,145,200,0.4)' }}>
                                <ListMusic size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                                <p style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>No playlists created</p>
                                <p style={{ fontSize: 13, marginTop: 4 }}>Create one from the sidebar to organize your music</p>
                            </div>
                        ) : (
                            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                                {playlists.map((pl, i) => (
                                    <motion.div key={pl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
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