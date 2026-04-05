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
    try {
      const title = await fetchYouTubeTitle(videoId)
      const thumbnail = getYouTubeThumbnail(videoId)
      setPreview({ title, thumbnail, videoId })
    } catch (e) {
      setError('Could not fetch video details. Check the URL.')
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
      <div style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 32px;
        }

        .url-input-wrapper {
          position: relative;
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 8px;
          transition: all 0.2s ease;
        }

        .url-input-wrapper:focus-within {
          background: rgba(167, 139, 250, 0.05);
          border-color: rgba(167, 139, 250, 0.4);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .url-field {
          flex: 1;
          background: transparent;
          border: none;
          color: #f0f0f8;
          font-size: 15px;
          padding-left: 40px;
          outline: none;
        }

        .preview-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          margin-top: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .btn-action {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-action:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-primary-wavify {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3);
        }
      `}</style>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 color="#ef4444" size={24} />
            </div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 42, fontWeight: 400, color: '#f5f0ff', lineHeight: 1 }}>
              Add Track
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)', marginLeft: 52 }}>
            Sync music from YouTube directly to your library
          </p>
        </header>

        <AnimatePresence mode="wait">
          {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={32} color="#34d399" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Successfully Synced!</h2>
                <p style={{ color: 'rgba(160,145,200,0.6)', fontSize: 15 }}>{preview?.title}</p>
              </motion.div>
          ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                <div className="glass-panel">
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(160,145,200,0.8)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Track URL
                  </label>

                  <div className="url-input-wrapper">
                    <Link2 size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(160,145,200,0.4)' }} />
                    <input
                        type="text"
                        placeholder="Paste YouTube link here..."
                        value={url}
                        onChange={e => { setUrl(e.target.value); setPreview(null); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handlePreview()}
                        className="url-field"
                    />
                    <button onClick={handlePaste} className="btn-action" title="Paste from clipboard">
                      <ClipboardPaste size={16} />
                    </button>
                    <button
                        onClick={handlePreview}
                        disabled={loading || !url.trim()}
                        className="btn-primary-wavify"
                        style={{ opacity: loading || !url.trim() ? 0.6 : 1 }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      Preview
                    </button>
                  </div>

                  {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#fb7185', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        • {error}
                      </motion.p>
                  )}

                  <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['youtube.com/watch', 'youtu.be/', 'youtube.com/shorts'].map(tag => (
                        <span key={tag} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {tag}
                   </span>
                    ))}
                  </div>
                </div>

                {/* Preview Section */}
                <AnimatePresence>
                  {preview && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="preview-card">
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                          <img src={preview.thumbnail} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,1) 0%, transparent 60%)' }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Play size={24} fill="#fff" color="#fff" />
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                            <p style={{ color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{preview.title}</p>
                            <p style={{ color: 'rgba(167,139,250,0.6)', fontSize: 12, marginTop: 4 }}>Ready to sync · ID: {preview.videoId}</p>
                          </div>
                        </div>
                        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
                          <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSave}
                              disabled={loading}
                              style={{
                                width: '100%', height: 48, background: '#fff', color: '#08080f',
                                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                cursor: 'pointer'
                              }}
                          >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Music2 size={18} />}
                            {loading ? 'Adding to Library...' : 'Confirm & Add Song'}
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