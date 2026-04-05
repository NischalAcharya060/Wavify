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
    try {
      const title = await fetchYouTubeTitle(videoId)
      const thumbnail = getYouTubeThumbnail(videoId)
      setPreview({ title, thumbnail, videoId })
    } catch (e) {
      setError('Could not fetch video details.')
    } finally {
      setLoading(false)
    }
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
    setTimeout(() => { onAdded?.(); onClose() }, 1500)
  }

  return (
      <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md"
          style={{ background: 'rgba(8, 8, 15, 0.85)' }}
          onClick={onClose}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .modal-glass {
          background: #12121a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 58, 237, 0.1);
          border-radius: 28px;
        }

        .url-input-container {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 6px;
          transition: all 0.2s ease;
        }

        .url-input-container:focus-within {
          border-color: rgba(167, 139, 250, 0.4);
          background: rgba(167, 139, 250, 0.04);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .modal-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="modal-glass w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                <Music2 size={18} color="#a78bfa" />
              </div>
              <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: '#f5f0ff' }}>
                Add Song
              </h2>
            </div>
            <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.4)', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-7">
            {success ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <CheckCircle2 size={36} color="#34d399" />
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Successfully Added</p>
                    <p style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)', marginTop: 4 }}>Track is now in your library</p>
                  </div>
                </div>
            ) : (
                <>
                  <div className="url-input-container mb-4">
                    <div className="relative flex-1 flex items-center">
                      <Link2 size={16} className="absolute left-3" style={{ color: 'rgba(160,145,200,0.4)' }} />
                      <input
                          type="text"
                          placeholder="Paste YouTube link..."
                          value={url}
                          onChange={e => { setUrl(e.target.value); setPreview(null); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && handlePreview()}
                          style={{
                            width: '100%', background: 'transparent', border: 'none',
                            padding: '12px 12px 12px 40px', color: '#fff', outline: 'none',
                            fontSize: '14px'
                          }}
                          autoFocus
                      />
                    </div>
                    <button
                        onClick={handlePreview}
                        disabled={loading || !url.trim()}
                        className="modal-btn-primary"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      Preview
                    </button>
                  </div>

                  {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-sm mb-4 flex items-center gap-2" style={{ color: '#fb7185' }}>
                        <X size={14} /> {error}
                      </motion.p>
                  )}

                  <AnimatePresence>
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '20px',
                              overflow: 'hidden'
                            }}>
                          <div className="relative aspect-video">
                            <img src={preview.thumbnail} alt={preview.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,18,26,0.95) 0%, transparent 60%)' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                                <Play size={20} fill="white" color="white" />
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {preview.title}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                style={{
                                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                  background: '#fff', color: '#08080f', fontWeight: 700, fontSize: 14,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justify: 'center', gap: 8
                                }}
                            >
                              {loading ? <Loader2 size={18} className="animate-spin" /> : <Music2 size={18} />}
                              {loading ? 'Adding to Library...' : 'Confirm & Add Song'}
                            </button>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {!preview && !loading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Music2 size={16} color="rgba(255,255,255,0.2)" />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Supports Watch links, Shorts, and youtu.be</span>
                      </div>
                  )}
                </>
            )}
          </div>
        </motion.div>
      </motion.div>
  )
}