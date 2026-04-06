'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Playlist } from '@/lib/types'
import { ListMusic, MoreHorizontal, Trash2, Play } from 'lucide-react'
import { useState } from 'react'

const themes = [
    { primary: '#7c3aed', secondary: '#4c1d95', glow: 'rgba(124, 58, 237, 0.3)' },
    { primary: '#10b981', secondary: '#065f46', glow: 'rgba(16, 185, 129, 0.3)' },
    { primary: '#f43f5e', secondary: '#9f1239', glow: 'rgba(244, 63, 94, 0.3)' },
    { primary: '#f59e0b', secondary: '#92400e', glow: 'rgba(245, 158, 11, 0.3)' },
    { primary: '#0ea5e9', secondary: '#075985', glow: 'rgba(14, 165, 233, 0.3)' },
]

export default function PlaylistCard({ playlist, songCount = 0, thumbnail, onDelete }: {
    playlist: Playlist; songCount?: number; thumbnail?: string; onDelete?: () => void
}) {
    const [showMenu, setShowMenu] = useState(false)
    const [hovered, setHovered] = useState(false)
    const theme = themes[playlist.name.charCodeAt(0) % themes.length]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="playlist-card-root"
            style={{
                position: 'relative',
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${theme.glow}` : 'none'
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .playlist-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 20px;
          color: #fff;
          margin: 0;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #fb7185;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .menu-item:active {
          background: rgba(251, 113, 133, 0.15);
        }

        @media (max-width: 640px) {
          .playlist-title { font-size: 18px; }
          .options-btn { opacity: 1 !important; background: rgba(0,0,0,0.6) !important; }
          .playlist-card-root { border-radius: 20px; }
        }
      `}</style>

            <Link href={`/playlist/${playlist.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                {/* Cover Art */}
                <div style={{
                    aspectRatio: '1',
                    position: 'relative',
                    margin: 10,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    background: '#12121a'
                }}>
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={playlist.name}
                            style={{
                                width: '100%', height: '100%', objectFit: 'cover',
                                transform: hovered ? 'scale(1.08)' : 'scale(1)',
                                transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ListMusic size={32} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Play Overlay */}
                    <AnimatePresence>
                        {hovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(8, 8, 15, 0.4)',
                                    backdropFilter: 'blur(4px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <Play size={20} fill="#08080f" color="#08080f" style={{ marginLeft: 2 }} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Metadata */}
                <div style={{ padding: '4px 16px 18px' }}>
                    <h3 className="playlist-title">{playlist.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.primary }}>
                {songCount} {songCount === 1 ? 'Track' : 'Tracks'}
              </span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Playlist
              </span>
                    </div>
                </div>
            </Link>

            {/* Options */}
            {onDelete && (
                <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                    <button
                        className="options-btn"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(v => !v) }}
                        style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', opacity: hovered || showMenu ? 1 : 0,
                            transition: 'all 0.2s'
                        }}
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <>
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                        zIndex: 40, background: 'rgba(18, 18, 26, 0.98)',
                                        backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 16, padding: 6, minWidth: 160,
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); setShowMenu(false); }}
                                        className="menu-item"
                                    >
                                        <Trash2 size={16} /> Delete Playlist
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}