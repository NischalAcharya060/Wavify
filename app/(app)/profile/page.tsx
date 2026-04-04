'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { LogOut, Music2, Heart, ListMusic, Clock, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({ songs: 0, playlists: 0, liked: 0, played: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { if (user) fetchStats() }, [user])

  const fetchStats = async () => {
    const [{ count: songs }, { count: playlists }, { count: liked }, { count: played }] = await Promise.all([
      supabase.from('songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('liked_songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('recently_played').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    ])
    setStats({ songs: songs || 0, playlists: playlists || 0, liked: liked || 0, played: played || 0 })
    setLoading(false)
  }

  const username = user?.email?.split('@')[0] || 'User'
  const initial = username[0]?.toUpperCase()

  const statItems = [
    { icon: Music2,   label: 'Songs',       value: stats.songs,    color: '#7c6af7' },
    { icon: ListMusic, label: 'Playlists',  value: stats.playlists, color: '#22c55e' },
    { icon: Heart,    label: 'Liked Songs', value: stats.liked,    color: '#f43f5e' },
    { icon: Clock,    label: 'Total Plays', value: stats.played,   color: '#f59e0b' },
  ]

  return (
    <div className="p-8 max-w-xl">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black mb-8">Profile</motion.h1>

      {/* Avatar + info card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-6 p-6 rounded-2xl mb-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-xl"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white' }}>
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2"
            style={{ background: 'var(--success)', borderColor: 'var(--bg-elevated)' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{username}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
            style={{ background: 'rgba(124,106,247,0.12)', color: 'var(--accent)' }}>
            Free Plan
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statItems.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              {loading
                ? <div className="skeleton h-7 w-10 mb-1 rounded" />
                : <p className="text-2xl font-black">{value}</p>
              }
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sign out */}
      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={signOut}
        className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-left"
        style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: 'var(--danger)' }}>
        <LogOut size={18} />
        <div>
          <p className="font-semibold">Sign Out</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(244,63,94,0.5)' }}>You&apos;ll need to log in again</p>
        </div>
      </motion.button>
    </div>
  )
}
