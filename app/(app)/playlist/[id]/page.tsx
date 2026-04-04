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
import { Play, Shuffle, ListMusic, Trash2, Pencil, Check, X } from 'lucide-react'

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
    if (!confirm('Delete this playlist?')) return
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

  const colors = [['#7c6af7','#a78bfa'],['#22c55e','#4ade80'],['#f43f5e','#fb7185'],['#f59e0b','#fcd34d'],['#0ea5e9','#38bdf8']]
  const colorSet = playlist ? colors[playlist.name.charCodeAt(0) % colors.length] : colors[0]

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="skeleton h-44 w-44 rounded-2xl" />
      <div className="skeleton h-10 w-64" />
      <div className="space-y-2 mt-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
      </div>
    </div>
  )

  if (!playlist) return (
    <div className="flex items-center justify-center h-full">
      <p style={{ color: 'var(--text-muted)' }}>Playlist not found</p>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${colorSet[0]}30 0%,var(--bg-base) 100%)` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 60%,${colorSet[0]}25,transparent 60%)` }} />
        <div className="relative px-8 pt-10 pb-8 flex items-end gap-7">
          <motion.div
            initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.4 }}
            className="w-44 h-44 rounded-2xl flex items-center justify-center shadow-2xl shrink-0"
            style={{ background: `linear-gradient(135deg,${colorSet[0]},${colorSet[1]})`, boxShadow: `0 20px 60px ${colorSet[0]}50` }}>
            <ListMusic size={64} color="rgba(255,255,255,0.85)" />
          </motion.div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Playlist</p>
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                  className="input-dark text-4xl font-black bg-transparent border-b border-t-0 border-x-0 rounded-none px-0 py-1 w-64"
                  autoFocus />
                <button onClick={saveEdit} className="btn-icon w-8 h-8" style={{ color: 'var(--success)' }}><Check size={16} /></button>
                <button onClick={() => setEditing(false)} className="btn-icon w-8 h-8"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-black">{playlist.name}</h1>
                <button onClick={() => setEditing(true)} className="btn-icon w-7 h-7 opacity-60 hover:opacity-100">
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>{songs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          {songs.length > 0 && (
            <>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={() => playSong(songs[0], songs)}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: `linear-gradient(135deg,${colorSet[0]},${colorSet[1]})` }}>
                <Play size={22} fill="white" color="white" />
              </motion.button>
              <button onClick={() => { const s=[...songs].sort(()=>Math.random()-.5); playSong(s[0],s) }}
                className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                <Shuffle size={15} /> Shuffle
              </button>
            </>
          )}
          <button onClick={deletePlaylist}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10"
            style={{ color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.15)' }}>
            <Trash2 size={15} /> Delete
          </button>
        </div>

        {songs.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
            <ListMusic size={48} className="mb-4 opacity-30" />
            <p className="font-semibold">Empty playlist</p>
            <p className="text-sm mt-1">Add songs via the ··· menu on any song</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {songs.map((song, i) => (
              <div key={song.id} className="group/row relative">
                <SongCard song={song} queue={songs}
                  isLiked={likedIds.has(song.id)} onLikeToggle={fetchAll}
                  playlists={allPlaylists} index={i} />
                <button
                  onClick={() => removeSong(song.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-opacity btn-icon w-7 h-7"
                  style={{ color: 'var(--danger)' }} title="Remove from playlist">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
