'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { extractYouTubeVideoId, getYouTubeThumbnail, fetchYouTubeTitle } from '@/lib/youtube'
import toast from 'react-hot-toast'
import { Link2, Loader2, CheckCircle2, Music2, ArrowRight, Play, ClipboardPaste } from 'lucide-react'

export default function AddSongPage() {
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
    if (!videoId) { setError('Please enter a valid YouTube URL'); return }
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
    if (err) { setError('Failed to save. Please try again.'); return }
    setSuccess(true)
    toast.success('Song added to library!')
    setTimeout(() => { setSuccess(false); setUrl(''); setPreview(null) }, 2500)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setPreview(null); setError('')
    } catch { toast.error('Could not read clipboard') }
  }

  return (
    <div className="p-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,0,0,0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4444">
            <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.3 12 21.3 12 21.3s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7zm-13.8 8.5V8.4l8 3.6-8 3.5z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black">Add Song</h1>
      </motion.div>
      <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        Paste any YouTube music video URL to save it to your library
      </p>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-20 rounded-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>
              <CheckCircle2 size={56} style={{ color: 'var(--success)' }} />
            </motion.div>
            <div className="text-center">
              <p className="text-xl font-bold mb-1">Song added!</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">{preview?.title}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* URL input card */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <label className="block text-sm font-semibold mb-3">YouTube URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="https://youtube.com/watch?v=…"
                    value={url} onChange={e => { setUrl(e.target.value); setPreview(null); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handlePreview()}
                    className="input-dark w-full pl-10 pr-4 py-3.5 rounded-xl" />
                </div>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={handlePaste}
                  className="btn-ghost px-4 rounded-xl text-sm flex items-center gap-2" title="Paste from clipboard">
                  <ClipboardPaste size={15} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={handlePreview} disabled={loading || !url.trim()}
                  className="btn-primary flex items-center gap-2 px-5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                  Preview
                </motion.button>
              </div>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</motion.p>
              )}
            </div>

            {/* Supported formats */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Supported formats</p>
              <div className="space-y-2">
                {[
                  'https://www.youtube.com/watch?v=VIDEO_ID',
                  'https://youtu.be/VIDEO_ID',
                  'https://youtube.com/shorts/VIDEO_ID',
                ].map(ex => (
                  <code key={ex} className="block text-xs px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                    {ex}
                  </code>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid var(--border)' }}>
                  <div className="relative group">
                    <img src={preview.thumbnail} alt={preview.title}
                      className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.45)' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                        <Play size={24} fill="white" color="white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-bold text-white leading-snug">{preview.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        ID: {preview.videoId}
                      </p>
                    </div>
                  </div>
                  <div className="p-4" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={handleSave} disabled={loading}
                      className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <Music2 size={15} />}
                      {loading ? 'Saving…' : 'Save to Library'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
