'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, SongAnalysis, AIRecommendation, GeneratedPlaylist } from '@/lib/types'
import toast from 'react-hot-toast'
import { Sparkles, Brain, ListMusic, Loader2, Music2, Plus, ExternalLink, Zap, Tag, RefreshCw } from 'lucide-react'

type ActiveTab = 'recommend' | 'playlist' | 'analyze'

export default function AIStudioPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<ActiveTab>('recommend')
  const [loading, setLoading] = useState(false)

  // Recommendations state
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [recError, setRecError] = useState('')

  // Playlist generation state
  const [playlistPrompt, setPlaylistPrompt] = useState('')
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null)
  const [plError, setPlError] = useState('')
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)

  // Analysis state
  const [analyses, setAnalyses] = useState<SongAnalysis[]>([])
  const [anaError, setAnaError] = useState('')

  const fetchRecommendations = async () => {
    setLoading(true); setRecError(''); setRecommendations([])
    try {
      const res = await fetch('/api/ai/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 8 }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setRecommendations(data.recommendations || [])
    } catch (e: unknown) {
      setRecError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const generatePlaylist = async () => {
    if (!playlistPrompt.trim()) return
    setLoading(true); setPlError(''); setGeneratedPlaylist(null)
    try {
      const res = await fetch('/api/ai/generate-playlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: playlistPrompt }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setGeneratedPlaylist(data)
    } catch (e: unknown) {
      setPlError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const savePlaylist = async () => {
    if (!generatedPlaylist || !user) return
    setCreatingPlaylist(true)
    try {
      const { data: pl, error: plErr } = await supabase.from('playlists').insert({ name: generatedPlaylist.playlistName, user_id: user.id }).select('id').single()
      if (plErr || !pl) throw new Error('Failed to create playlist')
      if (generatedPlaylist.existingSongs.length > 0) {
        const rows = generatedPlaylist.existingSongs.map(s => ({ playlist_id: pl.id, song_id: s.songId }))
        await supabase.from('playlist_songs').insert(rows)
      }
      toast.success(`Playlist "${generatedPlaylist.playlistName}" created!`)
      setGeneratedPlaylist(null); setPlaylistPrompt('')
    } catch {
      toast.error('Failed to create playlist')
    } finally {
      setCreatingPlaylist(false)
    }
  }

  const analyzeLibrary = async () => {
    setLoading(true); setAnaError(''); setAnalyses([])
    try {
      const { data: songs } = await supabase.from('songs').select('id').eq('user_id', user!.id).limit(20)
      if (!songs?.length) { setAnaError('Add some songs to your library first'); setLoading(false); return }
      const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songIds: songs.map(s => s.id) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAnalyses(data.results || [])
    } catch (e: unknown) {
      setAnaError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'recommend' as const, label: 'Discover', icon: Sparkles },
    { id: 'playlist' as const, label: 'Generate Playlist', icon: ListMusic },
    { id: 'analyze' as const, label: 'Mood Analysis', icon: Brain },
  ]

  const moodColors: Record<string, string> = {
    happy: '#34d399', energetic: '#fbbf24', chill: '#60a5fa', melancholic: '#818cf8',
    dark: '#6b7280', romantic: '#fb7185', angry: '#ef4444', peaceful: '#a78bfa',
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

        .ai-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.22s ease;
        }
        .ai-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }
        .ai-tab {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-tab:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
        }
        .ai-tab.active {
          background: rgba(124, 58, 237, 0.15);
          border-color: rgba(124, 58, 237, 0.3);
          color: #a78bfa;
        }
        .ai-btn {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .ai-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
        .ai-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ai-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px 18px;
          color: #fff;
          outline: none;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .ai-input:focus {
          border-color: rgba(167, 139, 250, 0.4);
          background: rgba(167, 139, 250, 0.04);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }
        .ai-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .rec-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .rec-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
        .mood-pill {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .energy-bar {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .energy-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
            <Sparkles size={20} color="#a78bfa" />
          </div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 36, fontWeight: 400, color: '#f5f0ff' }}>
            AI Studio
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginLeft: 52 }}>
          Discover music, generate playlists, and analyze vibes — powered by AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* === RECOMMENDATIONS === */}
        {activeTab === 'recommend' && (
          <motion.div key="recommend" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="ai-card">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Smart Recommendations</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>AI analyzes your library to suggest songs you&apos;ll love</p>
                </div>
                <button className="ai-btn" onClick={fetchRecommendations} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {recommendations.length ? 'Refresh' : 'Get Recommendations'}
                </button>
              </div>

              {recError && <p style={{ color: '#fb7185', fontSize: 13, marginBottom: 12 }}>{recError}</p>}

              {recommendations.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {recommendations.map((rec, i) => (
                    <motion.div key={i} className="rec-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                          <Music2 size={18} color="#a78bfa" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.title}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{rec.artist}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{rec.reason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={12} /> Find on YouTube
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && !recommendations.length && !recError && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Sparkles size={32} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Click the button to get AI-powered recommendations based on your library</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* === PLAYLIST GENERATION === */}
        {activeTab === 'playlist' && (
          <motion.div key="playlist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="ai-card">
              <div className="mb-5">
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Generate Playlist</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Describe a mood, vibe, or activity and AI will create a playlist from your library</p>
              </div>

              <div className="flex gap-3 mb-5" style={{ flexWrap: 'wrap' }}>
                <input
                  className="ai-input"
                  placeholder="e.g. chill study vibes, late night drive, workout energy..."
                  value={playlistPrompt}
                  onChange={e => setPlaylistPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generatePlaylist()}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <button className="ai-btn" onClick={generatePlaylist} disabled={loading || !playlistPrompt.trim()}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ListMusic size={16} />}
                  Generate
                </button>
              </div>

              {/* Quick prompts */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {['Chill & Relaxing', 'Workout Energy', 'Late Night Vibes', 'Road Trip', 'Focus Mode'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setPlaylistPrompt(q); }}
                    style={{
                      padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#a78bfa' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {plError && <p style={{ color: '#fb7185', fontSize: 13, marginBottom: 12 }}>{plError}</p>}

              {generatedPlaylist && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20 }}>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{generatedPlaylist.playlistName}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{generatedPlaylist.description}</p>
                    </div>
                    <button className="ai-btn" onClick={savePlaylist} disabled={creatingPlaylist}>
                      {creatingPlaylist ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Save Playlist
                    </button>
                  </div>

                  {generatedPlaylist.existingSongs.length > 0 && (
                    <div className="mb-4">
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>From Your Library</p>
                      <div className="flex flex-col gap-1">
                        {generatedPlaylist.existingSongs.map((s, i) => (
                          <div key={i} className="flex items-center gap-3" style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                            <Music2 size={14} color="rgba(255,255,255,0.3)" />
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedPlaylist.newSuggestions.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>New Suggestions</p>
                      <div className="flex flex-col gap-1">
                        {generatedPlaylist.newSuggestions.map((s, i) => (
                          <div key={i} className="flex items-center justify-between gap-3" style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                            <div className="flex items-center gap-3">
                              <Sparkles size={14} color="#a78bfa" />
                              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.title} — {s.artist}</span>
                            </div>
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.searchQuery)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0 }}
                            >
                              <ExternalLink size={11} /> Find
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {!loading && !generatedPlaylist && !plError && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <ListMusic size={32} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Describe a mood or vibe and AI will curate a playlist from your songs</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* === MOOD ANALYSIS === */}
        {activeTab === 'analyze' && (
          <motion.div key="analyze" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="ai-card">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Mood Analysis</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>AI analyzes your songs and tags them by mood, energy, and genre</p>
                </div>
                <button className="ai-btn" onClick={analyzeLibrary} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  {analyses.length ? 'Re-analyze' : 'Analyze Library'}
                </button>
              </div>

              {anaError && <p style={{ color: '#fb7185', fontSize: 13, marginBottom: 12 }}>{anaError}</p>}

              {analyses.length > 0 && (
                <div className="flex flex-col gap-3">
                  {analyses.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{a.vibe}</p>
                        <div className="flex items-center gap-2">
                          <span className="mood-pill" style={{ background: `${moodColors[a.mood] || '#a78bfa'}20`, color: moodColors[a.mood] || '#a78bfa' }}>
                            {a.mood}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          <Zap size={12} color="#fbbf24" />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Energy</span>
                        </div>
                        <div className="energy-bar" style={{ flex: 1, maxWidth: 120 }}>
                          <div className="energy-fill" style={{ width: `${a.energy * 10}%`, background: `linear-gradient(90deg, #7c3aed, #a78bfa)` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{a.energy}/10</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {a.genres.map((g, gi) => (
                          <span key={gi} style={{
                            padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 500,
                            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <Tag size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                            {g}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && !analyses.length && !anaError && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Brain size={32} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Analyze your library to discover the mood and energy of your songs</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
