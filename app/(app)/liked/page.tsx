'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import { usePlayer } from '@/lib/PlayerContext'
import { Heart, Play, Shuffle, ShieldCheck } from 'lucide-react'

export default function LikedSongsPage() {
    const { user } = useAuth()
    const [songs, setSongs] = useState<Song[]>([])
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(true)
    const { playSong } = usePlayer()
    const supabase = createClient()

    // --- Logic for Username Consistency ---
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    const fetchAll = async () => {
        setLoading(true)
        const [{ data: liked }, { data: pls }] = await Promise.all([
            supabase.from('liked_songs').select('*, songs(*)')
                .eq('user_id', user!.id).order('liked_at', { ascending: false }),
            supabase.from('playlists').select('*').eq('user_id', user!.id)
        ])
        setSongs((liked || []).map((l: any) => l.songs).filter(Boolean))
        setPlaylists(pls || [])
        setLoading(false)
    }

    useEffect(() => { if (user) fetchAll() }, [user])

    const shufflePlay = () => {
        if (!songs.length) return
        const s = [...songs].sort(() => Math.random() - 0.5)
        playSong(s[0], s)
    }

    return (
        <div className="liked-songs-wrapper" style={{ fontFamily: 'Geist, sans-serif' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .play-btn-main {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white; border: none; cursor: pointer;
          box-shadow: 0 10px 25px rgba(109, 40, 217, 0.4);
          transition: all 0.2s ease;
        }

        .play-btn-main:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 15px 30px rgba(109, 40, 217, 0.5);
        }

        .shuffle-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 20px; border-radius: 12px;
          font-size: 14px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: all 0.2s;
        }

        .shuffle-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }

        @media (max-width: 768px) {
          .hero-section { padding: 40px 20px 24px !important; text-align: center; }
          .hero-content { flex-direction: column !important; align-items: center !important; gap: 20px !important; }
          .hero-image { width: 140px !important; height: 140px !important; }
          .hero-image svg { width: 50px !important; height: 50px !important; }
          .hero-title { font-size: 48px !important; margin-bottom: 8px !important; }
          .hero-stats { justify-content: center; }
          .content-body { padding: 20px !important; }
          .controls-row { justify-content: center; gap: 12px !important; }
        }
      `}</style>

            {/* Hero Section */}
            <div className="hero-section" style={{
                position: 'relative',
                padding: '60px 32px 32px',
                background: 'linear-gradient(to bottom, #1e1b4b 0%, #08080f 100%)',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '80%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="hero-content" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 32, zIndex: 10 }}>
                    <motion.div
                        className="hero-image"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            width: 190, height: 190, borderRadius: 24,
                            background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            flexShrink: 0
                        }}
                    >
                        <Heart size={80} fill="white" color="white" />
                    </motion.div>

                    <div style={{ paddingBottom: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#a78bfa', marginBottom: 12 }}>
                            Playlist
                        </p>
                        <h1 className="hero-title" style={{
                            fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
                            fontSize: 72, fontWeight: 400, color: '#fff',
                            lineHeight: 0.9, marginBottom: 16
                        }}>
                            Liked Songs
                        </h1>
                        <div className="hero-stats" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 600, color: '#fff' }}>{displayName}</span>
                            </div>
                            <span>•</span>
                            <span>{songs.length} tracks</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls & List */}
            <div className="content-body" style={{ padding: '24px 32px' }}>
                {songs.length > 0 && (
                    <div className="controls-row" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => playSong(songs[0], songs)}
                            className="play-btn-main"
                            aria-label="Play all liked songs"
                        >
                            <Play size={28} fill="currentColor" />
                        </motion.button>

                        <button onClick={shufflePlay} className="shuffle-btn" aria-label="Shuffle play liked songs">
                            <Shuffle size={18} /> Shuffle
                        </button>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 6 }} />
                                    <div className="skeleton" style={{ height: 10, width: '15%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : songs.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center', color: 'rgba(160,145,200,0.4)' }}>
                        <Heart size={48} strokeWidth={1.5} style={{ marginBottom: 16, opacity: 0.2 }} />
                        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500 }}>No favorites yet</h3>
                        <p style={{ fontSize: 14, marginTop: 4 }}>Tap the heart on any song to save it here</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {songs.map((song, i) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                queue={songs}
                                isLiked
                                onLikeToggle={fetchAll}
                                playlists={playlists}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}