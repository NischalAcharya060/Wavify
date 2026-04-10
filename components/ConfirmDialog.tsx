'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', variant = 'danger', loading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'
  const iconColor = isDanger ? '#fb7185' : '#f59e0b'
  const iconBg = isDanger ? 'rgba(251,113,133,0.12)' : 'rgba(245,158,11,0.12)'
  const btnBg = isDanger ? 'rgba(251,113,133,0.15)' : 'rgba(245,158,11,0.15)'
  const btnBorder = isDanger ? 'rgba(251,113,133,0.3)' : 'rgba(245,158,11,0.3)'
  const btnColor = isDanger ? '#fb7185' : '#f59e0b'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              background: 'rgba(16,14,28,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: 28, width: '90%', maxWidth: 380,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}>
              {isDanger ? <Trash2 size={20} color={iconColor} /> : <AlertTriangle size={20} color={iconColor} />}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f0ecff', marginBottom: 10 }}>{title}</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(160,145,200,0.6)', lineHeight: 1.55, marginBottom: 24 }}>{description}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  background: btnBg, border: `1px solid ${btnBorder}`,
                  color: btnColor, cursor: loading ? 'wait' : 'pointer',
                  fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
