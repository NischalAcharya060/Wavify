'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Settings, Keyboard, Trash2, Clock, User, ChevronRight, Volume2, Search } from 'lucide-react'

const shortcuts = [
  { keys: 'Space', action: 'Play / Pause' },
  { keys: '←', action: 'Seek backward 10s' },
  { keys: '→', action: 'Seek forward 10s' },
  { keys: 'Shift + ←', action: 'Previous track' },
  { keys: 'Shift + →', action: 'Next track' },
  { keys: '↑', action: 'Volume up' },
  { keys: '↓', action: 'Volume down' },
  { keys: 'M', action: 'Toggle mute' },
  { keys: 'N', action: 'Next track' },
  { keys: 'P', action: 'Previous track' },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [confirmClearRecent, setConfirmClearRecent] = useState(false)
  const [confirmClearSearch, setConfirmClearSearch] = useState(false)
  const [clearing, setClearing] = useState(false)

  const clearRecentlyPlayed = async () => {
    if (!user) return
    setClearing(true)
    await supabase.from('recently_played').delete().eq('user_id', user.id)
    toast.success('Recently played cleared')
    setConfirmClearRecent(false)
    setClearing(false)
  }

  const clearSearchHistory = () => {
    localStorage.removeItem('wavify_recent_searches')
    toast.success('Search history cleared')
    setConfirmClearSearch(false)
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto' }}>
      <style>{`
        .setting-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .setting-card:hover {
          border-color: rgba(255,255,255,0.1);
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .setting-row-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .setting-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .shortcut-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 8px;
          margin-top: 16px;
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
        }
        .shortcut-key {
          font-size: 12px;
          font-weight: 600;
          color: #a78bfa;
          background: rgba(167,139,250,0.1);
          padding: 3px 10px;
          border-radius: 6px;
          font-family: monospace;
        }
        .btn-setting {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-setting:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .btn-setting.danger {
          color: #fb7185;
          border-color: rgba(251,113,133,0.15);
        }
        .btn-setting.danger:hover {
          background: rgba(251,113,133,0.08);
        }
        @media (max-width: 640px) {
          .shortcut-grid { grid-template-columns: 1fr; }
          .setting-title { font-size: 36px !important; }
        }
      `}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} color="#a78bfa" />
          </div>
          <h1 className="setting-title" style={{ fontSize: 42, fontWeight: 400, color: '#f5f0ff', fontFamily: 'Syne, sans-serif' }}>
            Settings
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)', marginBottom: 36, marginLeft: 58 }}>
          Manage your preferences
        </p>
      </motion.div>

      {/* Account Link */}
      <Link href="/profile" style={{ textDecoration: 'none', display: 'block' }}>
        <div className="setting-card" style={{ cursor: 'pointer' }}>
          <div className="setting-row">
            <div className="setting-row-left">
              <div className="setting-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <User size={18} color="#a78bfa" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Account</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Profile, password, connected accounts</p>
              </div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
          </div>
        </div>
      </Link>

      {/* Keyboard Shortcuts */}
      <div className="setting-card">
        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-icon" style={{ background: 'rgba(52,211,153,0.1)' }}>
              <Keyboard size={18} color="#34d399" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Keyboard Shortcuts</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Control playback from your keyboard</p>
            </div>
          </div>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map(s => (
            <div key={s.keys} className="shortcut-item">
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s.action}</span>
              <span className="shortcut-key">{s.keys}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Recently Played */}
      <div className="setting-card">
        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-icon" style={{ background: 'rgba(251,191,36,0.1)' }}>
              <Clock size={18} color="#fbbf24" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Recently Played</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Clear your listening history</p>
            </div>
          </div>
          <button onClick={() => setConfirmClearRecent(true)} className="btn-setting danger">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Clear Search History */}
      <div className="setting-card">
        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-icon" style={{ background: 'rgba(14,165,233,0.1)' }}>
              <Search size={18} color="#0ea5e9" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Search History</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Clear your saved search queries</p>
            </div>
          </div>
          <button onClick={() => setConfirmClearSearch(true)} className="btn-setting danger">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearRecent}
        onClose={() => setConfirmClearRecent(false)}
        onConfirm={clearRecentlyPlayed}
        title="Clear recently played?"
        description="This will remove all your listening history. This action cannot be undone."
        confirmLabel="Clear History"
        loading={clearing}
      />
      <ConfirmDialog
        open={confirmClearSearch}
        onClose={() => setConfirmClearSearch(false)}
        onConfirm={clearSearchHistory}
        title="Clear search history?"
        description="This will remove all your saved search queries from this device."
        confirmLabel="Clear Searches"
      />
    </div>
  )
}
