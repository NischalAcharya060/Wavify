'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { LogOut, Music2, Heart, ListMusic, Clock, ShieldCheck, ChevronRight, CheckCircle2, Edit2, X, Check, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const { user, signOut } = useAuth()
    const [stats, setStats] = useState({ songs: 0, playlists: 0, liked: 0, played: 0 })
    const [loading, setLoading] = useState(true)

    // Username States
    const [isEditing, setIsEditing] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [updating, setUpdating] = useState(false)

    // Password States
    const [showPassModal, setShowPassModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPass, setShowPass] = useState(false)

    const supabase = createClient()

    // FIX: More robust provider detection
    const providers = user?.app_metadata?.providers || []
    const identities = user?.identities?.map(id => id.provider) || []
    const isGoogleConnected = providers.includes('google') || identities.includes('google')
    const isEmailUser = providers.includes('email') || identities.includes('email')

    const googleAvatar = user?.user_metadata?.avatar_url
    const currentUsername = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    useEffect(() => {
        if (user) {
            fetchStats()
            setNewUsername(currentUsername)
        }
    }, [user])

    const fetchStats = async () => {
        try {
            const [songs, playlists, liked, played] = await Promise.all([
                supabase.from('songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
                supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
                supabase.from('liked_songs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
                supabase.from('recently_played').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
            ])
            setStats({ songs: songs.count || 0, playlists: playlists.count || 0, liked: liked.count || 0, played: played.count || 0 })
        } finally { setLoading(false) }
    }

    const handleUpdateUsername = async () => {
        if (!newUsername.trim() || newUsername === currentUsername) return setIsEditing(false)
        setUpdating(true)
        const { error } = await supabase.auth.updateUser({ data: { display_name: newUsername.trim() } })
        if (error) toast.error(error.message)
        else { toast.success('Username updated!'); setIsEditing(false); }
        setUpdating(false)
    }

    const handleChangePassword = async () => {
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters")
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match")
        setUpdating(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) toast.error(error.message)
        else {
            toast.success("Password updated!"); setShowPassModal(false);
            setNewPassword(''); setConfirmPassword('');
        }
        setUpdating(false)
    }

    return (
        <div className="profile-container" style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto', color: '#fff' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Syne:wght@800&display=swap');
                .profile-title { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 48px; margin-bottom: 32px; }
                .action-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 20px; margin-bottom: 16px; transition: 0.2s; }
                .input-field { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; color: #fff; width: 100%; outline: none; transition: 0.2s; }
                .input-field:focus { border-color: #7c3aed; background: rgba(124,58,237,0.05); }
                .btn-primary { background: #7c3aed; color: #fff; border: none; padding: 12px 24px; borderRadius: 12px; font-weight: 700; cursor: pointer; }
            `}</style>

            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="profile-title">Profile Settings</motion.h1>

            {/* User Hero */}
            <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32, background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), transparent)' }}>
                <div style={{ position: 'relative' }}>
                    {googleAvatar ? (
                        <img src={googleAvatar} style={{ width: 80, height: 80, borderRadius: 24, border: '2px solid #7c3aed' }} />
                    ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>{currentUsername[0]}</div>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input className="input-field" value={newUsername} onChange={e => setNewUsername(e.target.value)} style={{ fontSize: 20, fontWeight: 700 }} />
                            <button onClick={handleUpdateUsername} className="btn-primary" style={{ padding: '0 15px' }}><Check size={20}/></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h2 style={{ fontSize: 28, fontFamily: 'Syne' }}>{currentUsername}</h2>
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><Edit2 size={18}/></button>
                        </div>
                    )}
                    <p style={{ opacity: 0.5 }}>{user?.email}</p>
                </div>
            </div>

            {/* Google Connection Status */}
            <div className="action-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        </div>
                        <div>
                            <p style={{ fontWeight: 700 }}>Google Identity</p>
                            <p style={{ fontSize: 12, color: isGoogleConnected ? '#10b981' : '#666' }}>{isGoogleConnected ? 'Verified & Linked' : 'Not connected'}</p>
                        </div>
                    </div>
                    {isGoogleConnected && <CheckCircle2 color="#10b981" size={20} />}
                </div>
            </div>

            {/* Enhanced Password Section */}
            <div className="action-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ padding: 10, background: 'rgba(124, 58, 237, 0.1)', borderRadius: 12 }}>
                            <KeyRound size={20} color="#a78bfa" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700 }}>Account Security</p>
                            <p style={{ fontSize: 12, color: '#666' }}>Manage your password</p>
                        </div>
                    </div>
                    {isEmailUser ? (
                        <button onClick={() => setShowPassModal(!showPassModal)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>
                            {showPassModal ? 'Cancel' : 'Change'}
                        </button>
                    ) : (
                        <span style={{ fontSize: 11, opacity: 0.3 }}>Managed by Google</span>
                    )}
                </div>

                <AnimatePresence>
                    {showPassModal && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? "text" : "password"} placeholder="New password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#666' }}>{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                </div>
                                <input type="password" placeholder="Confirm password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                <button onClick={handleChangePassword} disabled={updating} className="btn-primary" style={{ width: '100%', marginTop: 8 }}>{updating ? 'Processing...' : 'Update Password'}</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout */}
            <button onClick={signOut} style={{ width: '100%', padding: 20, borderRadius: 24, background: 'rgba(251, 113, 133, 0.05)', border: '1px solid rgba(251, 113, 133, 0.1)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><LogOut size={20}/> <span style={{ fontWeight: 700 }}>Log Out</span></div>
                <ChevronRight size={20} style={{ opacity: 0.3 }} />
            </button>
        </div>
    )
}