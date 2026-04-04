'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { extractYouTubeVideoId, getYouTubeThumbnail, fetchYouTubeTitle } from '@/lib/youtube'
import toast from 'react-hot-toast'
import { X, Link2, Loader2, CheckCircle2, Music2, ArrowRight, Play } from 'lucide-react'

interface AddSongModalProps {
  onClose: () => void
  onAdded?: () => void
}

export default function AddSongModal({ onClose, onAdded }: AddSongModalProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ title: string; thumbnail: string; videoId: string } | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const handlePreview = async () => {
    setError(''); setPreview(null)
    const videoId = extractYouTubeVideoId(url.trim())
    if (!videoId) { setError('Invalid YouTube URL'); return }
    setLoading(true)
    const title = await fetchYouTubeTitle(videoId)
    const thumbnail = getYouTubeThumbnail(videoId)
    setPreview({ title, thumbnail, videoId })
    setLoading(false)
  }

  const handleSave = async () => {
    if (!preview || !user) return
    setLoading(true)
    const { error: err } = await supabase.from('songs').insert({
      title: preview.title, youtube_url: url,
      video_id: preview.videoId, thumbnail: preview.thumbnail, user_id: user.id,
    })
    setLoading(false)
    if (err) { setError('Failed to save. Try again.'); return }
    setSuccess(true)
    toast.success('Song added to library!')
    setTimeout(() => { onAdded?.(); onClose() }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale:0.92, opacity:0, y:12 }}
        animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.92, opacity:0, y:12 }}
        transition={{ duration:0.2 }}
        className="glass rounded-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))' }}>
              <Music2 size={14} color="white" />
            </div>
            <h2 className="font-bold">Add Song</h2>
          </div>
          <button onClick={onClose} className="btn-icon w-7 h-7"><X size={16} /></button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300, damping:20 }}>
                <CheckCircle2 size={52} style={{ color: 'var(--success)' }} />
              </motion.div>
              <p className="font-semibold text-lg">Song added!</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text" placeholder="https://youtube.com/watch?v=…"
                    value={url} onChange={e => { setUrl(e.target.value); setPreview(null); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handlePreview()}
                    className="input-dark w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                    autoFocus
                  />
                </div>
                <button onClick={handlePreview} disabled={loading || !url.trim()}
                  className="btn-primary flex items-center gap-1.5 px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                  Preview
                </button>
              </div>

              {error && (
                <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                  className="text-sm mb-4" style={{ color: 'var(--danger)' }}>
                  {error}
                </motion.p>
              )}

              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    className="rounded-xl overflow-hidden mb-4"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="relative">
                      <img src={preview.thumbnail} alt={preview.title} className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 50%)' }} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                          <Play size={20} fill="white" color="white" />
                        </div>
                      </div>
                      <p className="absolute bottom-3 left-3 right-3 font-semibold text-sm text-white leading-tight line-clamp-2">
                        {preview.title}
                      </p>
                    </div>
                    <div className="p-3">
                      <button onClick={handleSave} disabled={loading}
                        className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Music2 size={15} />}
                        {loading ? 'Saving…' : 'Save to Library'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
