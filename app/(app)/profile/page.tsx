'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { LogOut, Music2, Heart, ListMusic, Clock, ShieldCheck, Crown, ChevronRight } from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({ songs: 0, playlists: 0, liked: 0, played: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { if (user) fetchStats() }, [user])

  const fetchStats = async () => {
    try {
      const [songs, playlists, liked, played] = await Promise.all([
        supabase.from('songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('liked_songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('recently_played').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      ])
      setStats({
        songs: songs.count || 0,
        playlists: playlists.count || 0,
        liked: liked.count || 0,
        played: played.count || 0
      })
    } finally {
      setLoading(false)
    }
  }

  const username = user?.email?.split('@')[0] || 'User'
  const initial = username[0]?.toUpperCase()

  const statItems = [
    { icon: Music2,   label: 'Tracks Added', value: stats.songs,    color: '#a78bfa' },
    { icon: ListMusic, label: 'Playlists',    value: stats.playlists, color: '#10b981' },
    { icon: Heart,    label: 'Favorites',    value: stats.liked,     color: '#fb7185' },
    { icon: Clock,    label: 'Stream Count', value: stats.played,    color: '#38bdf8' },
  ]

  return (
      <div style={{ padding: '40px 32px', maxWidth: 800, margin: '0 auto' }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Syne:wght@800&display=swap');
        
        .profile-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 48px;
          color: #fff;
          margin-bottom: 32px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>

        <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="profile-title"
        >
          Account Profile
        </motion.h1>

        {/* Hero User Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(76, 29, 149, 0.05))',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: 32, padding: '40px', marginBottom: 32,
              display: 'flex', alignItems: 'center', gap: 32,
              position: 'relative', overflow: 'hidden'
            }}
        >
          {/* Animated Background Decor */}
          <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity }}
              style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: '#7c3aed', filter: 'blur(80px)' }}
          />

          <div style={{ position: 'relative' }}>
            <div style={{
              width: 100, height: 100, borderRadius: 28,
              background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif',
              boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)'
            }}>
              {initial}
            </div>
            <div style={{
              position: 'absolute', bottom: -8, right: -8,
              background: '#10b981', padding: 6, borderRadius: 12,
              border: '4px solid #08080f', color: '#fff'
            }}>
              <ShieldCheck size={16} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{username}</h2>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255, 184, 0, 0.1)', padding: '4px 10px',
                borderRadius: 100, border: '1px solid rgba(255, 184, 0, 0.2)'
              }}>
                <Crown size={12} color="#ffb800" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ffb800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium</span>
              </div>
            </div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{user?.email}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {statItems.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="stat-card"
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={24} color={color} />
                </div>
                {loading ? (
                    <div style={{ height: 32, width: 60, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />
                ) : (
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{value}</p>
                )}
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{label}</p>
              </motion.div>
          ))}
        </div>

        {/* Danger Zone / Log Out */}
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ x: 5 }}
            onClick={signOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '24px 32px', borderRadius: 24,
              background: 'rgba(251, 113, 133, 0.05)',
              border: '1px solid rgba(251, 113, 133, 0.1)',
              color: '#fb7185', cursor: 'pointer', transition: 'all 0.2s'
            }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251, 113, 133, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Log out of Wavify</p>
              <p style={{ fontSize: 13, color: 'rgba(251, 113, 133, 0.5)' }}>Securely end your current session</p>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </motion.button>
      </div>
  )
}