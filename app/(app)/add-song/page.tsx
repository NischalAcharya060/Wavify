'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import {
  extractYouTubeVideoId,
  extractYouTubePlaylistId,
  getYouTubeThumbnail,
  fetchYouTubeTitle,
} from '@/lib/youtube'
import toast from 'react-hot-toast'
import {
  Link2, Loader2, CheckCircle2, Music2, ArrowRight, Play, ClipboardPaste,
  ListMusic, CheckSquare, Square, Download,
} from 'lucide-react'

type Mode = 'track' | 'playlist'

interface PlaylistItem {
  videoId: string
  title: string
  thumbnail: string
  author?: string
}

export default function AddSongPage() {
  const [mode, setMode] = useState<Mode>('track')

  // Track mode state
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ title: string; thumbnail: string; videoId: string } | null>(null)

  // Playlist mode state
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [plLoading, setPlLoading] = useState(false)
  const [plError, setPlError] = useState('')
  const [plTitle, setPlTitle] = useState('')
  const [plItems, setPlItems] = useState<PlaylistItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [existingVideoIds, setExistingVideoIds] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [createPlaylist, setCreatePlaylist] = useState(true)
  const [importDone, setImportDone] = useState<{ added: number; skipped: number } | null>(null)

  const { user } = useAuth()
  const supabase = createClient()

  // ---------- Track flow ----------
  const handlePreview = async () => {
    setError(''); setPreview(null)
    const videoId = extractYouTubeVideoId(url.trim())
    if (!videoId) {
      setError('Please enter a valid YouTube URL')
      toast.error('Invalid YouTube URL')
      return
    }
    setLoading(true)
    const t = toast.loading('Fetching track details...')
    try {
      const title = await fetchYouTubeTitle(videoId)
      const thumbnail = getYouTubeThumbnail(videoId)
      setPreview({ title, thumbnail, videoId })
      toast.success('Track found', { id: t })
    } catch {
      setError('Could not fetch video details. Check the URL.')
      toast.error('Could not fetch video details', { id: t })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preview || !user) return
    setLoading(true)
    const t = toast.loading('Adding to library...')
    const { data: existing } = await supabase.from('songs').select('id').eq('user_id', user.id).eq('video_id', preview.videoId).limit(1)
    if (existing && existing.length > 0) {
      setError('This song is already in your library')
      toast.error('Already in your library', { id: t })
      setLoading(false)
      return
    }
    const { error: err } = await supabase.from('songs').insert({
      title: preview.title, youtube_url: url,
      video_id: preview.videoId, thumbnail: preview.thumbnail, user_id: user.id,
    })
    setLoading(false)
    if (err) {
      setError('Failed to save. Please try again.')
      toast.error('Failed to save song', { id: t })
      return
    }
    setSuccess(true)
    toast.success('Song added to library!', { id: t })
    setTimeout(() => { setSuccess(false); setUrl(''); setPreview(null) }, 2500)
  }

  const handlePaste = async (which: 'track' | 'playlist') => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) { toast.error('Clipboard is empty'); return }
      if (which === 'track') { setUrl(text); setPreview(null); setError('') }
      else { setPlaylistUrl(text); setPlItems([]); setSelected(new Set()); setPlError('') }
      toast.success('Pasted from clipboard')
    } catch { toast.error('Could not read clipboard') }
  }

  // ---------- Playlist flow ----------
  const handleFetchPlaylist = async () => {
    setPlError(''); setPlItems([]); setSelected(new Set()); setExistingVideoIds(new Set()); setImportDone(null)
    const playlistId = extractYouTubePlaylistId(playlistUrl.trim())
    if (!playlistId) {
      setPlError('Please enter a valid YouTube playlist URL (must contain ?list=...)')
      toast.error('Invalid playlist URL')
      return
    }
    setPlLoading(true)
    const t = toast.loading('Loading playlist...')
    try {
      const res = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPlError(data.error || 'Failed to fetch playlist')
        toast.error(data.error || 'Failed to fetch playlist', { id: t })
        return
      }
      const items: PlaylistItem[] = data.items || []
      setPlTitle(data.title || 'YouTube Playlist')
      setPlItems(items)

      let existing = new Set<string>()
      if (user && items.length > 0) {
        const { data: rows } = await supabase
          .from('songs')
          .select('video_id')
          .eq('user_id', user.id)
          .in('video_id', items.map(i => i.videoId))
        existing = new Set((rows || []).map(r => r.video_id))
      }
      setExistingVideoIds(existing)
      setSelected(new Set(items.filter(i => !existing.has(i.videoId)).map(i => i.videoId)))

      const newCount = items.length - existing.size
      if (items.length === 0) {
        toast.error('No tracks found in this playlist', { id: t })
      } else if (newCount === 0) {
        toast(`All ${items.length} tracks are already in your library`, { id: t, icon: 'ℹ️' })
      } else {
        toast.success(`Loaded ${items.length} tracks · ${newCount} new`, { id: t })
      }
    } catch {
      setPlError('Network error. Please try again.')
      toast.error('Network error', { id: t })
    } finally {
      setPlLoading(false)
    }
  }

  const toggleOne = (videoId: string) => {
    if (existingVideoIds.has(videoId)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId)
      return next
    })
  }

  const toggleAll = () => {
    const selectable = plItems.filter(i => !existingVideoIds.has(i.videoId))
    if (selected.size === selectable.length) setSelected(new Set())
    else setSelected(new Set(selectable.map(i => i.videoId)))
  }

  const handleImport = async () => {
    if (!user) { toast.error('You must be signed in'); return }
    if (selected.size === 0) { toast.error('Select at least one song'); return }
    setImporting(true); setImportProgress(0); setImportDone(null)
    const t = toast.loading(`Importing ${selected.size} song${selected.size === 1 ? '' : 's'}...`)

    const toImport = plItems.filter(i => selected.has(i.videoId))

    // Find existing songs to avoid duplicates
    const { data: existingRows } = await supabase
      .from('songs')
      .select('id, video_id')
      .eq('user_id', user.id)
      .in('video_id', toImport.map(i => i.videoId))

    const existingMap = new Map<string, string>() // videoId -> songId
    ;(existingRows || []).forEach(r => existingMap.set(r.video_id, r.id))

    const newRows = toImport
      .filter(i => !existingMap.has(i.videoId))
      .map(i => ({
        title: i.title,
        youtube_url: `https://www.youtube.com/watch?v=${i.videoId}`,
        video_id: i.videoId,
        thumbnail: i.thumbnail,
        user_id: user.id,
      }))

    let insertedSongs: { id: string; video_id: string }[] = []
    if (newRows.length > 0) {
      const { data: inserted, error: insErr } = await supabase
        .from('songs')
        .insert(newRows)
        .select('id, video_id')
      if (insErr) {
        setImporting(false)
        toast.error('Failed to import songs', { id: t })
        return
      }
      insertedSongs = inserted || []
    }
    setImportProgress(60)

    const allSongIds: string[] = [
      ...insertedSongs.map(s => s.id),
      ...toImport.filter(i => existingMap.has(i.videoId)).map(i => existingMap.get(i.videoId)!),
    ]

    let playlistCreated = false
    if (createPlaylist && allSongIds.length > 0) {
      const { data: pl, error: plErr } = await supabase
        .from('playlists')
        .insert({ name: plTitle || 'YouTube Playlist', user_id: user.id })
        .select('id')
        .single()
      if (!plErr && pl) {
        const rows = allSongIds.map(song_id => ({ playlist_id: pl.id, song_id }))
        const { error: linkErr } = await supabase.from('playlist_songs').insert(rows)
        if (linkErr) toast.error('Songs saved, but linking to playlist failed')
        else playlistCreated = true
      } else {
        toast.error('Songs saved, but could not create playlist')
      }
    }

    setImportProgress(100)
    setImporting(false)
    setImportDone({ added: insertedSongs.length, skipped: existingMap.size })

    const parts: string[] = []
    if (insertedSongs.length > 0) parts.push(`${insertedSongs.length} added`)
    if (existingMap.size > 0) parts.push(`${existingMap.size} skipped`)
    const summary = parts.length > 0 ? parts.join(' · ') : 'Nothing to import'
    if (insertedSongs.length === 0 && existingMap.size > 0) {
      toast(`All ${existingMap.size} songs were already in your library`, { id: t, icon: 'ℹ️' })
    } else {
      toast.success(playlistCreated ? `${summary} · Playlist created` : summary, { id: t })
    }
  }

  const resetPlaylist = () => {
    setPlaylistUrl(''); setPlItems([]); setSelected(new Set()); setExistingVideoIds(new Set()); setPlError(''); setImportDone(null); setPlTitle('')
  }

  return (
    <div className="add-song-container" style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
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
          border-color: rgba(167, 139, 250, 0.5);
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
          min-width: 0;
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
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-action:hover { background: rgba(255, 255, 255, 0.1); }

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
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3);
          white-space: nowrap;
        }

        .mode-tabs {
          display: inline-flex;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 24px;
        }
        .mode-tab {
          background: transparent;
          color: rgba(160,145,200,0.7);
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .mode-tab.active {
          background: rgba(124,58,237,0.25);
          color: #fff;
          box-shadow: 0 2px 10px rgba(124,58,237,0.25);
        }

        .pl-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pl-item:hover { background: rgba(255,255,255,0.04); }
        .pl-item.selected { background: rgba(124,58,237,0.12); }
        .pl-item.disabled { cursor: not-allowed; opacity: 0.55; }
        .pl-item.disabled:hover { background: transparent; }

        .pl-thumb {
          width: 64px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .pl-list {
          max-height: 420px;
          overflow-y: auto;
          margin-top: 16px;
          padding-right: 6px;
        }
        .pl-list::-webkit-scrollbar { width: 6px; }
        .pl-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .checkbox-toggle {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          padding: 6px 8px;
          border-radius: 8px;
        }
        .checkbox-toggle:hover { background: rgba(255,255,255,0.05); }

        @media (max-width: 640px) {
          .add-song-container { padding: 24px 16px !important; }
          .glass-panel { padding: 20px !important; }
          .url-input-wrapper {
            flex-direction: column;
            background: transparent;
            border: none;
            padding: 0;
            gap: 16px;
          }
          .url-field-container {
             background: rgba(255, 255, 255, 0.04);
             border: 1px solid rgba(255, 255, 255, 0.09);
             border-radius: 14px;
             padding: 12px;
             position: relative;
          }
          .url-field { padding-left: 36px; width: 100%; }
          .btn-primary-wavify { width: 100%; height: 48px; }
          .page-title { font-size: 32px !important; }
          .tag-cloud { display: none !important; }
          .preview-title { font-size: 16px !important; }
          .header-subtext { margin-left: 0 !important; margin-top: 8px; }
          .pl-thumb { width: 56px; height: 32px; }
        }
      `}</style>

      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Music2 color="#ef4444" size={24} />
          </div>
          <h1 className="page-title" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 42, fontWeight: 400, color: '#f5f0ff', lineHeight: 1 }}>
            Add Music
          </h1>
        </div>
        <p className="header-subtext" style={{ fontSize: 14, color: 'rgba(160,145,200,0.5)', marginLeft: 52 }}>
          Sync a single track or import an entire playlist from YouTube
        </p>
      </header>

      {/* Mode tabs */}
      <div className="mode-tabs">
        <button className={`mode-tab ${mode === 'track' ? 'active' : ''}`} onClick={() => setMode('track')}>
          <Music2 size={14} /> Single Track
        </button>
        <button className={`mode-tab ${mode === 'playlist' ? 'active' : ''}`} onClick={() => setMode('playlist')}>
          <ListMusic size={14} /> Playlist
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'track' ? (
          <motion.div key="track-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {success ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={32} color="#34d399" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Successfully Synced!</h2>
                <p style={{ color: 'rgba(160,145,200,0.6)', fontSize: 15 }}>{preview?.title}</p>
              </div>
            ) : (
              <>
                <div className="glass-panel">
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(160,145,200,0.8)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Track URL
                  </label>

                  <div className="url-input-wrapper">
                    <div className="url-field-container" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Link2 size={18} style={{ position: 'absolute', left: 16, color: 'rgba(160,145,200,0.4)' }} />
                      <input
                        type="text"
                        placeholder="Paste YouTube link here..."
                        value={url}
                        onChange={e => { setUrl(e.target.value); setPreview(null); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handlePreview()}
                        className="url-field"
                      />
                      <button onClick={() => handlePaste('track')} className="btn-action" title="Paste from clipboard" style={{ border: 'none', padding: '8px' }}>
                        <ClipboardPaste size={16} />
                      </button>
                    </div>

                    <button
                      onClick={handlePreview}
                      disabled={loading || !url.trim()}
                      className="btn-primary-wavify"
                      style={{ opacity: loading || !url.trim() ? 0.6 : 1 }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      Preview Track
                    </button>
                  </div>

                  {error && (
                    <p style={{ color: '#fb7185', fontSize: 13, marginTop: 12 }}>• {error}</p>
                  )}

                  <div className="tag-cloud" style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['youtube.com/watch', 'youtu.be/', 'youtube.com/shorts'].map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {preview && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="preview-card">
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                        <img src={preview.thumbnail} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,1) 0%, transparent 80%)' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={24} fill="#fff" color="#fff" />
                          </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
                          <p className="preview-title" style={{ color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{preview.title}</p>
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
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="playlist-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {importDone ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={32} color="#34d399" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Playlist Imported</h2>
                <p style={{ color: 'rgba(160,145,200,0.7)', fontSize: 15 }}>
                  {importDone.added} new song{importDone.added === 1 ? '' : 's'} added
                  {importDone.skipped > 0 ? ` · ${importDone.skipped} already in library` : ''}
                </p>
                <button onClick={resetPlaylist} className="btn-primary-wavify" style={{ margin: '24px auto 0' }}>
                  Import Another
                </button>
              </div>
            ) : (
              <>
                <div className="glass-panel">
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(160,145,200,0.8)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Playlist URL
                  </label>

                  <div className="url-input-wrapper">
                    <div className="url-field-container" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <ListMusic size={18} style={{ position: 'absolute', left: 16, color: 'rgba(160,145,200,0.4)' }} />
                      <input
                        type="text"
                        placeholder="Paste YouTube playlist link..."
                        value={playlistUrl}
                        onChange={e => { setPlaylistUrl(e.target.value); setPlItems([]); setSelected(new Set()); setPlError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleFetchPlaylist()}
                        className="url-field"
                      />
                      <button onClick={() => handlePaste('playlist')} className="btn-action" title="Paste from clipboard" style={{ border: 'none', padding: '8px' }}>
                        <ClipboardPaste size={16} />
                      </button>
                    </div>

                    <button
                      onClick={handleFetchPlaylist}
                      disabled={plLoading || !playlistUrl.trim()}
                      className="btn-primary-wavify"
                      style={{ opacity: plLoading || !playlistUrl.trim() ? 0.6 : 1 }}
                    >
                      {plLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      Fetch Playlist
                    </button>
                  </div>

                  {plError && <p style={{ color: '#fb7185', fontSize: 13, marginTop: 12 }}>• {plError}</p>}

                  <div className="tag-cloud" style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      youtube.com/playlist?list=...
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {plItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="glass-panel"
                      style={{ marginTop: 20 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 11, color: 'rgba(160,145,200,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Playlist</p>
                          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{plTitle}</h3>
                          <p style={{ color: 'rgba(160,145,200,0.6)', fontSize: 13, marginTop: 4 }}>
                            {plItems.length} track{plItems.length === 1 ? '' : 's'} found · {selected.size} selected
                            {existingVideoIds.size > 0 ? ` · ${existingVideoIds.size} already in library` : ''}
                          </p>
                        </div>
                        {(() => {
                          const selectable = plItems.filter(i => !existingVideoIds.has(i.videoId)).length
                          const allSelected = selectable > 0 && selected.size === selectable
                          return (
                            <button onClick={toggleAll} className="checkbox-toggle" disabled={selectable === 0}>
                              {allSelected ? <CheckSquare size={16} color="#a78bfa" /> : <Square size={16} />}
                              {allSelected ? 'Deselect all' : 'Select all new'}
                            </button>
                          )
                        })()}
                      </div>

                      <div className="pl-list">
                        {plItems.map((item, idx) => {
                          const inLibrary = existingVideoIds.has(item.videoId)
                          const isSel = selected.has(item.videoId)
                          return (
                            <div
                              key={item.videoId}
                              className={`pl-item ${isSel ? 'selected' : ''} ${inLibrary ? 'disabled' : ''}`}
                              onClick={() => toggleOne(item.videoId)}
                              title={inLibrary ? 'Already in your library' : undefined}
                            >
                              {inLibrary
                                ? <CheckCircle2 size={18} color="#34d399" />
                                : isSel
                                  ? <CheckSquare size={18} color="#a78bfa" />
                                  : <Square size={18} color="rgba(255,255,255,0.3)" />}
                              <span style={{ width: 22, fontSize: 12, color: 'rgba(160,145,200,0.5)', textAlign: 'right' }}>{idx + 1}</span>
                              <img src={item.thumbnail} alt="" className="pl-thumb" />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ color: inLibrary ? 'rgba(240,240,248,0.5)' : '#f0f0f8', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title}
                                </p>
                                {item.author && (
                                  <p style={{ color: 'rgba(160,145,200,0.5)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.author}
                                  </p>
                                )}
                              </div>
                              {inLibrary && (
                                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                                  In Library
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="toolbar">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={createPlaylist}
                            onChange={e => setCreatePlaylist(e.target.checked)}
                            style={{ accentColor: '#7c3aed' }}
                          />
                          Also create a playlist named &ldquo;{plTitle}&rdquo;
                        </label>

                        <button
                          onClick={handleImport}
                          disabled={importing || selected.size === 0}
                          className="btn-primary-wavify"
                          style={{ opacity: importing || selected.size === 0 ? 0.6 : 1 }}
                        >
                          {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          {importing ? `Importing... ${importProgress}%` : `Import ${selected.size} song${selected.size === 1 ? '' : 's'}`}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
