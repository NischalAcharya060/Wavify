'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import { usePlayer } from '@/lib/PlayerContext'
import toast from 'react-hot-toast'
import { Play, Shuffle, ListMusic, Trash2, Pencil, Check, X, Music2 } from 'lucide-react'

export default function PlaylistPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const { playSong } = usePlayer()
  const supabase = createClient()

  useEffect(() => { if (user && id) fetchAll() }, [user, id])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: pl }, { data: ps }, { data: liked }, { data: pls }] = await Promise.all([
      supabase.from('playlists').select('*').eq('id', id).single(),
      supabase.from('playlist_songs').select('*, songs(*)').eq('playlist_id', id),
      supabase.from('liked_songs').select('song_id').eq('user_id', user!.id),
      supabase.from('playlists').select('*').eq('user_id', user!.id),
    ])
    setPlaylist(pl)
    setEditName(pl?.name || '')
    setSongs((ps || []).map((r: any) => r.songs).filter(Boolean))
    setLikedIds(new Set((liked || []).map((l: any) => l.song_id)))
    setAllPlaylists(pls || [])
    setLoading(false)
  }

  const removeSong = async (songId: string) => {
    await supabase.from('playlist_songs').delete().eq('playlist_id', id).eq('song_id', songId)
    toast.success('Removed from playlist')
    fetchAll()
  }

  const deletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return
    await supabase.from('playlists').delete().eq('id', id)
    toast.success('Playlist deleted')
    router.push('/library')
  }

  const saveEdit = async () => {
    if (!editName.trim()) return
    await supabase.from('playlists').update({ name: editName.trim() }).eq('id', id)
    setEditing(false)
    fetchAll()
    toast.success('Playlist renamed')
  }

  const themes = [
    { primary: '#7c3aed', secondary: '#4c1d95', glow: 'rgba(124, 58, 237, 0.3)' },
    { primary: '#10b981', secondary: '#065f46', glow: 'rgba(16, 185, 129, 0.3)' },
    { primary: '#f43f5e', secondary: '#9f1239', glow: 'rgba(244, 63, 94, 0.3)' },
    { primary: '#f59e0b', secondary: '#92400e', glow: 'rgba(245, 158, 11, 0.3)' },
    { primary: '#0ea5e9', secondary: '#075985', glow: 'rgba(14, 165, 233, 0.3)' },
  ]
  const theme = playlist ? themes[playlist.name.charCodeAt(0) % themes.length] : themes[0]

  if (loading) return (
      <div style={{ padding: '40px 32px' }}>
        <div className="skeleton" style={{ width: 190, height: 190, borderRadius: 24, background: 'rgba(255,255,255,0.05)' }} />
        <div className="skeleton" style={{ height: 48, width: '60%', borderRadius: 8, marginTop: 24, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }} />)}
        </div>
      </div>
  )

  if (!playlist) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.3)' }}>
        <p>Playlist not found</p>
      </div>
  )

  return (
      <div className="playlist-page-wrapper" style={{ fontFamily: 'Geist, sans-serif' }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .edit-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 64px;
          outline: none;
          padding: 0 12px;
          border-radius: 12px;
          width: 100%;
          min-width: 0;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .delete-btn {
          color: #fb7185;
          border: 1px solid rgba(251, 113, 133, 0.15);
        }

        .play-main {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .playlist-hero {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            padding: 40px 20px 24px !important;
          }
          .hero-art {
            width: 140px !important;
            height: 140px !important;
          }
          .hero-art svg { width: 50px !important; }
          .hero-title { font-size: 44px !important; justify-content: center; }
          .edit-input { font-size: 32px; }
          .controls-bar { flex-wrap: wrap; justify-content: center; gap: 12px !important; }
          .delete-btn { order: 3; width: 100%; justify-content: center; margin-left: 0 !important; }
          .page-content { padding: 20px !important; }
          .remove-song-btn { right: 12px !important; }
        }
      `}</style>

        {/* Hero Section */}
        <div className="playlist-hero" style={{
          position: 'relative',
          padding: '60px 32px 32px',
          background: `linear-gradient(to bottom, ${theme.secondary}80 0%, #08080f 100%)`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 32
        }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '80%', background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <motion.div
              className="hero-art"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: 190, height: 190, borderRadius: 24,
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
                flexShrink: 0,
                zIndex: 1
              }}
          >
            <ListMusic size={80} color="rgba(255,255,255,0.9)" />
          </motion.div>

          <div style={{ flex: 1, paddingBottom: 8, zIndex: 1, width: '100%' }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: theme.primary, marginBottom: 12 }}>
              Playlist
            </p>

            {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'inherit' }}>
                  <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                      className="edit-input"
                      autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEdit} style={{ background: '#34d39920', color: '#34d399', border: 'none', padding: 12, borderRadius: 12, cursor: 'pointer' }}><Check size={20} /></button>
                    <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: 12, borderRadius: 12, cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                </div>
            ) : (
                <div className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <h1 style={{
                    fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
                    fontSize: 72, fontWeight: 400, color: '#fff',
                    lineHeight: 0.9
                  }}>
                    {playlist.name}
                  </h1>
                  <button
                      onClick={() => setEditing(true)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', padding: 8, borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Pencil size={18} />
                  </button>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 16, justifyContent: 'inherit' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{user?.email?.split('@')[0]}</span>
              <span>•</span>
              <span>{songs.length} tracks</span>
            </div>
          </div>
        </div>

        {/* Controls & List */}
        <div className="page-content" style={{ padding: '24px 32px' }}>
          <div className="controls-bar" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            {songs.length > 0 && (
                <>
                  <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => playSong(songs[0], songs)}
                      className="play-main"
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 10px 25px ${theme.glow}` }}
                  >
                    <Play size={28} fill="currentColor" />
                  </motion.button>

                  <button
                      onClick={() => { const s=[...songs].sort(()=>Math.random()-.5); playSong(s[0],s) }}
                      className="action-btn"
                  >
                    <Shuffle size={18} /> Shuffle
                  </button>
                </>
            )}

            <button onClick={deletePlaylist} className="action-btn delete-btn" style={{ marginLeft: 'auto' }}>
              <Trash2 size={16} /> <span>Delete Playlist</span>
            </button>
          </div>

          {songs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center', color: 'rgba(160,145,200,0.4)' }}>
                <Music2 size={48} strokeWidth={1.5} style={{ marginBottom: 16, opacity: 0.2 }} />
                <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500 }}>Empty playlist</h3>
                <p style={{ fontSize: 14, marginTop: 4 }}>Add tracks from your library to start listening</p>
              </div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {songs.map((song, i) => (
                    <div key={song.id} style={{ position: 'relative' }}>
                      <SongCard
                          song={song}
                          queue={songs}
                          isLiked={likedIds.has(song.id)}
                          onLikeToggle={fetchAll}
                          playlists={allPlaylists}
                          index={i}
                      />
                      <button
                          className="remove-song-btn"
                          onClick={() => removeSong(song.id)}
                          style={{
                            position: 'absolute', right: 54, top: '50%', transform: 'translateY(-50%)',
                            background: 'transparent', border: 'none', color: 'rgba(251, 113, 133, 0.4)',
                            cursor: 'pointer', padding: 8, zIndex: 2
                          }}
                          title="Remove from playlist"
                      >
                        <X size={16} />
                      </button>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  )
}