'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playlist } from '@/lib/types'
import { ListMusic, MoreHorizontal, Trash2, Play } from 'lucide-react'
import { useState } from 'react'

interface PlaylistCardProps {
  playlist: Playlist
  songCount?: number
  thumbnail?: string
  onDelete?: () => void
}

const gradients = [
  ['#7c6af7', '#a78bfa'],
  ['#22c55e', '#4ade80'],
  ['#f43f5e', '#fb7185'],
  ['#f59e0b', '#fcd34d'],
  ['#0ea5e9', '#38bdf8'],
  ['#8b5cf6', '#c084fc'],
  ['#06b6d4', '#67e8f9'],
]

export default function PlaylistCard({ playlist, songCount = 0, thumbnail, onDelete }: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const colorSet = gradients[playlist.name.charCodeAt(0) % gradients.length]

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="group relative rounded-xl overflow-hidden cursor-pointer"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <Link href={`/playlist/${playlist.id}`} className="block">
        {/* Cover art */}
        <div className="aspect-square relative overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={playlist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108" />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${colorSet[0]}, ${colorSet[1]})` }}>
              {/* Decorative rings */}
              <div className="absolute w-32 h-32 rounded-full opacity-20 border-2 border-white" style={{ top: -20, right: -20 }} />
              <div className="absolute w-20 h-20 rounded-full opacity-15 border border-white" style={{ bottom: -10, left: -10 }} />
              <ListMusic size={38} color="rgba(255,255,255,0.85)" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'white' }}>
              <Play size={18} fill="black" color="black" style={{ marginLeft: 2 }} />
            </motion.div>
          </div>
        </div>

        <div className="p-3">
          <p className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}>{playlist.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </Link>

      {/* More menu */}
      {onDelete && (
        <div className="absolute top-2 right-2" onClick={e => e.preventDefault()}>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(v => !v) }}
            className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'white', backdropFilter: 'blur(4px)' }}>
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 z-40 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', minWidth: 140 }}>
                <button
                  onClick={() => { onDelete(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-red-500/10 text-left"
                  style={{ color: 'var(--danger)' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
