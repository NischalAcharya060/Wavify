'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Song, Playlist } from '@/lib/types'
import { usePlayer } from '@/lib/PlayerContext'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { useContextMenu } from '@/lib/useContextMenu'
import toast from 'react-hot-toast'
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Music2, ListMusic, ChevronRight } from 'lucide-react'

interface SongCardProps {
    song: Song; queue?: Song[]; isLiked?: boolean; onLikeToggle?: () => void
    onDelete?: () => void; showDelete?: boolean; index?: number
    playlists?: Playlist[]; view?: 'list' | 'grid'
}

function EqBars({ color = '#7c3aed' }: { color?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
            {[...Array(4)].map((_, i) => (
                <motion.span
                    key={i}
                    animate={{ height: [4, 14, 6, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
                    style={{ width: 2.5, background: color, borderRadius: 10 }}
                />
            ))}
        </div>
    )
}

export default function SongCard({ song, queue, isLiked = false, onLikeToggle, onDelete, showDelete, index, playlists = [], view = 'list' }: SongCardProps) {
    const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer()
    const { user } = useAuth()
    const [liked, setLiked] = useState(isLiked)
    const [showMenu, setShowMenu] = useState(false)
    const [showPLPicker, setShowPLPicker] = useState(false)
    const { menu: ctxMenu, open: openCtx, close: closeCtx } = useContextMenu()
    const supabase = createClient()
    const isActive = currentSong?.id === song.id
    const [hovered, setHovered] = useState(false)

    const handlePlay = () => { if (isActive) togglePlayPause(); else playSong(song, queue || [song]) }

    const handleLike = async (e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!user) return
        const newStatus = !liked
        setLiked(newStatus)
        if (!newStatus) {
            await supabase.from('liked_songs').delete().eq('user_id', user.id).eq('song_id', song.id)
            toast('Removed from Liked Songs', { icon: '💔' })
        } else {
            await supabase.from('liked_songs').insert({ user_id: user.id, song_id: song.id })
            toast.success('Added to Liked Songs')
        }
        onLikeToggle?.()
    }

    const addToPlaylist = async (plId: string, plName: string) => {
        await supabase.from('playlist_songs').upsert({ playlist_id: plId, song_id: song.id })
        toast.success(`Added to ${plName}`)
        setShowMenu(false); setShowPLPicker(false); closeCtx()
    }

    const handleDelete = () => { onDelete?.(); closeCtx(); toast.success('Song deleted') }

    // ---------------------------------------------------------
    // GRID VIEW (Mobile Friendly)
    // ---------------------------------------------------------
    if (view === 'grid') {
        return (
            <motion.div
                whileHover={{ y: -6 }}
                onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
                style={{
                    borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                }}
                onClick={handlePlay} onContextMenu={openCtx}>
                <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', margin: 8, borderRadius: 14 }}>
                    {song.thumbnail
                        ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={24} color="rgba(255,255,255,0.2)" /></div>
                    }
                    {isActive && isPlaying && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <EqBars color="#a78bfa" />
                        </div>
                    )}
                </div>
                <div style={{ padding: '0 12px 14px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? '#a78bfa' : '#fff' }}>{song.title}</p>
                </div>
                {ctxMenu.visible && <CtxMenu playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} onClose={closeCtx} />}
            </motion.div>
        )
    }

    // ---------------------------------------------------------
    // LIST VIEW (Mobile Optimized)
    // ---------------------------------------------------------
    return (
        <>
            <style>{`
        .song-row {
          display: flex; align-items: center; gap: 12px; padding: 10px;
          border-radius: 14px; cursor: pointer; transition: all 0.2s;
          border: 1px solid transparent; margin-bottom: 2px;
          -webkit-tap-highlight-color: transparent;
        }
        .song-row:active { background: rgba(255,255,255,0.06); }
        .song-row.active { background: rgba(124, 58, 237, 0.08); border-color: rgba(124, 58, 237, 0.15); }
        
        .song-actions { display: flex; align-items: center; gap: 4px; }
        
        /* Desktop specific: Hide actions unless hovering */
        @media (min-width: 1024px) {
          .song-actions { opacity: 0; transition: opacity 0.2s; }
          .song-row:hover .song-actions { opacity: 1; }
          .song-row:hover { background: rgba(255,255,255,0.04); }
        }

        @media (max-width: 640px) {
          .song-row { gap: 10px; padding: 8px; }
          .song-index { display: none !important; }
          .song-thumb { width: 48px !important; height: 48px !important; }
          .song-title { font-size: 14px !important; }
        }
      `}</style>

            <div
                className={`song-row ${isActive ? 'active' : ''}`}
                onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                onClick={handlePlay} onContextMenu={openCtx}
            >
                {/* Index / Playing Icon */}
                <div className="song-index" style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isActive && isPlaying ? <EqBars color="#a78bfa" /> : (
                        hovered
                            ? <Play size={14} fill="currentColor" style={{ color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.6)' }} />
                            : <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)' }}>{index !== undefined ? index + 1 : ''}</span>
                    )}
                </div>

                {/* Thumbnail */}
                <div className="song-thumb" style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {song.thumbnail
                        ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={16} color="rgba(255,255,255,0.2)" /></div>
                    }
                </div>

                {/* Title & Artist */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="song-title" style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? '#a78bfa' : '#fff' }}>
                        {song.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>YouTube Music</p>
                </div>

                {/* Actions */}
                <div className="song-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, color: liked ? '#fb7185' : 'rgba(255,255,255,0.2)' }}>
                        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => { setShowMenu(v => !v); setShowPLPicker(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, color: 'rgba(255,255,255,0.2)' }}>
                            <MoreHorizontal size={20} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowMenu(false)} />
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 40, background: 'rgba(18,18,26,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 6, minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                        {showPLPicker ? (
                                            <div className="p-1">
                                                <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Add to Playlist</div>
                                                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                                                    {playlists.map(pl => (
                                                        <MenuBtn key={pl.id} icon={<ListMusic size={14} />} label={pl.name} onClick={() => addToPlaylist(pl.id, pl.name)} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-1">
                                                <MenuBtn icon={<Plus size={16} />} label="Add to Playlist" onClick={() => setShowPLPicker(true)} />
                                                <MenuBtn icon={<Heart size={16} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Unlike' : 'Like'} onClick={handleLike} danger={liked} />
                                                {showDelete && onDelete && (
                                                    <>
                                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
                                                        <MenuBtn icon={<Trash2 size={16} />} label="Delete" onClick={handleDelete} danger />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {ctxMenu.visible && <CtxMenu playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} onClose={closeCtx} />}
        </>
    )
}

function MenuBtn({ icon, label, onClick, danger }: any) {
    return (
        <button onClick={onClick}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, color: danger && label !== 'Like' ? '#fb7185' : '#fff', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
            <span style={{ opacity: 0.5 }}>{icon}</span> {label}
        </button>
    )
}

function CtxMenu({ playlists, liked, showDelete, onLike, onAdd, onDelete, x, y, onClose }: any) {
    const [showPL, setShowPL] = useState(false)
    // Ensure context menu doesn't go off screen
    const adjustedX = x + 200 > window.innerWidth ? x - 200 : x;
    const adjustedY = y + 200 > window.innerHeight ? y - 200 : y;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
            <div style={{ left: adjustedX, top: adjustedY, position: 'fixed', zIndex: 9999, background: 'rgba(18,18,26,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 6, minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <MenuBtn icon={<Heart size={16} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Unlike' : 'Like'} onClick={onLike} danger={liked} />
                <button
                    onClick={() => setShowPL(!showPL)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Plus size={16} style={{ opacity: 0.5 }} /> Add to Playlist
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.3 }} />
                </button>

                {showPL && (
                    <div style={{ maxHeight: 200, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4, paddingTop: 4 }}>
                        {playlists.map((pl: Playlist) => (
                            <button key={pl.id} onClick={() => onAdd(pl.id, pl.name)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                <ListMusic size={14} /> {pl.name}
                            </button>
                        ))}
                    </div>
                )}

                {showDelete && (
                    <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
                        <MenuBtn icon={<Trash2 size={16} />} label="Delete" onClick={onDelete} danger />
                    </>
                )}
            </div>
        </>
    )
}