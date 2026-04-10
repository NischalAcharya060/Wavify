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
import ConfirmDialog from '@/components/ConfirmDialog'
import { Play, Shuffle, ListMusic, Trash2, Pencil, Check, X, Music2 } from 'lucide-react'

const themes = [
  { primary: '#7c3aed', secondary: '#4c1d95', glow: 'rgba(124,58,237,0.3)' },
  { primary: '#10b981', secondary: '#065f46', glow: 'rgba(16,185,129,0.3)'  },
  { primary: '#f43f5e', secondary: '#9f1239', glow: 'rgba(244,63,94,0.3)'   },
  { primary: '#f59e0b', secondary: '#92400e', glow: 'rgba(245,158,11,0.3)'  },
  { primary: '#0ea5e9', secondary: '#075985', glow: 'rgba(14,165,233,0.3)'  },
]

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
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { playSong } = usePlayer()
  const supabase = createClient()

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

  useEffect(() => { if (user && id) fetchAll() }, [user, id])

  const theme = playlist ? themes[playlist.name.charCodeAt(0) % themes.length] : themes[0]

  if (loading) return (
    <div style={{ padding: '40px 32px', fontFamily: 'Geist, sans-serif' }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginBottom: 40 }}>
        <div className="skeleton" style={{ width: 180, height: 180, borderRadius: 20, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 52, width: '65%', borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 14, width: 140, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div className="skeleton" style={{ height: 12, width: '55%', borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 10, width: '25%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!playlist) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.3)', fontFamily: 'Geist, sans-serif' }}>
      Playlist not found
    </div>
  )

  return (
    <div style={{ fontFamily: 'Geist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

        .edit-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: white; outline: none;
          font-family: 'Instrument Serif', serif;
          font-style: italic; font-size: 56px;
          padding: 4px 16px; border-radius: 14px;
          width: 100%; min-width: 0; line-height: 1;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .edit-input:focus {
          border-color: rgba(167,139,250,0.4);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        .action-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
          padding: 10px 18px; border-radius: 12px;
          font-size: 13.5px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Geist', sans-serif;
        }
        .action-btn:hover { background: rgba(255,255,255,0.07); color: white; }
        .delete-btn { color: #fb7185 !important; border-color: rgba(251,113,133,0.15) !important; }
        .delete-btn:hover { background: rgba(251,113,133,0.08) !important; border-color: rgba(251,113,133,0.25) !important; }

@media (max-width: 768px) {
          .pl-hero { flex-direction: column !important; align-items: center !important; text-align: center; padding: 36px 20px 24px !important; }
          .hero-art { width: 140px !important; height: 140px !important; }
          .hero-title { font-size: 42px !important; justify-content: center; }
          .edit-input { font-size: 36px; }
          .pl-controls { flex-wrap: wrap; justify-content: center !important; gap: 10px !important; }
          .delete-btn { order: 3; }
          .pl-content { padding: 20px !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="pl-hero" style={{
        position: 'relative', overflow: 'hidden',
        padding: '56px 32px 32px',
        background: `linear-gradient(to bottom, ${theme.secondary}70 0%, #08080f 100%)`,
        display: 'flex', alignItems: 'flex-end', gap: 32,
      }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-8%', width: '45%', height: '90%', background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Art */}
        <motion.div className="hero-art"
          initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 190, height: 190, borderRadius: 22, flexShrink: 0,
            background: `linear-gradient(145deg, ${theme.primary}, ${theme.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${theme.glow}`,
            position: 'relative', overflow: 'hidden', zIndex: 1,
          }}>
          {/* inner ring decoration */}
          <div style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', top: '-20%', right: '-20%', pointerEvents: 'none' }} />
          <ListMusic size={76} color="rgba(255,255,255,0.85)" strokeWidth={1.25} />
          {/* track count badge */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20, padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {songs.length} {songs.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>
        </motion.div>

        {/* Info */}
        <div style={{ flex: 1, paddingBottom: 4, zIndex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: theme.primary, marginBottom: 14 }}>
            Playlist
          </p>

          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                className="edit-input"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveEdit} style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '10px 14px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Check size={18} />
                </button>
                <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
                fontSize: 68, fontWeight: 400, color: '#fff', lineHeight: 0.95,
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {playlist.name}
              </h1>
              <button onClick={() => setEditing(true)}
                aria-label="Rename playlist"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: 9, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}>
                <Pencil size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13.5, color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{user?.email?.split('@')[0]}</span>
            <span>·</span>
            <span>{songs.length} {songs.length === 1 ? 'track' : 'tracks'}</span>
            {songs.length === 0 && <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 10px' }}>Empty</span>}
          </div>
        </div>
      </div>

      {/* Controls + Track List */}
      <div className="pl-content" style={{ padding: '24px 32px 48px' }}>
        <div className="pl-controls" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          {songs.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => playSong(songs[0], songs)}
                style={{
                  width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', border: 'none', cursor: 'pointer',
                  boxShadow: `0 8px 24px ${theme.glow}`,
                }}>
                <Play size={26} fill="currentColor" />
              </motion.button>
              <button
                onClick={() => { const s = [...songs].sort(() => Math.random() - 0.5); playSong(s[0], s) }}
                className="action-btn"
                aria-label="Shuffle play playlist">
                <Shuffle size={16} /> Shuffle
              </button>
            </>
          )}

          <button onClick={() => setConfirmDelete(true)} className="action-btn delete-btn" style={{ marginLeft: 'auto' }} aria-label="Delete playlist">
            <Trash2 size={15} /> Delete
          </button>
        </div>

        {/* Track header row */}
        {songs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
            <span style={{ width: 22, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', flexShrink: 0 }}>#</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>Title</span>
            <div style={{ width: 80, flexShrink: 0 }} />
          </div>
        )}

        {/* Tracks */}
        {songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0', color: 'rgba(160,145,200,0.35)' }}>
            <Music2 size={44} strokeWidth={1.25} style={{ marginBottom: 16, opacity: 0.18 }} />
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, fontWeight: 500, marginBottom: 6 }}>This playlist is empty</h3>
            <p style={{ fontSize: 13 }}>Add tracks from your library using the ··· menu on any song</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {songs.map((song, i) => (
              <div key={song.id} style={{ position: 'relative' }}>
                <SongCard song={song} queue={songs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchAll} playlists={allPlaylists} index={i} />
                {/* Remove button — shown on row hover via song-actions opacity */}
                <button
                  onClick={() => removeSong(song.id)}
                  style={{
                    position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: 'rgba(251,113,133,0.35)', cursor: 'pointer',
                    padding: 8, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.15s', zIndex: 2,
                    opacity: 0,
                  }}
                  title="Remove from playlist"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = '#fb7185' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0' }}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deletePlaylist}
        title={`Delete "${playlist.name}"?`}
        description="This will permanently remove the playlist. Songs in your library will not be affected."
        confirmLabel="Delete Playlist"
        variant="danger"
      />
    </div>
  )
}
