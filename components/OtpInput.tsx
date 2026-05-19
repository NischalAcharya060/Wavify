'use client'

import { useEffect, useRef } from 'react'

interface OtpInputProps {
  value: string
  onChange: (next: string) => void
  /** Called when all `length` digits are filled. */
  onComplete?: (full: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  /** Render the boxes in an "error" red state. */
  error?: boolean
}

/**
 * Segmented numeric OTP input. Each digit lives in its own box but the value
 * is owned by the parent as a single string. Supports:
 *  - typing a digit auto-advances focus
 *  - backspace on an empty box steps back
 *  - arrow keys move focus
 *  - pasting a 6-digit code fills all boxes at once
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  error = false,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  // Fire onComplete exactly when the value reaches full length.
  useEffect(() => {
    if (value.length === length) onComplete?.(value)
    // We intentionally don't depend on onComplete to avoid re-firing if the
    // parent rebuilds the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length])

  const setDigit = (idx: number, raw: string) => {
    // Strip non-digits, take the last char (handles holding a key).
    const ch = raw.replace(/\D/g, '').slice(-1)
    const arr = digits.slice()
    arr[idx] = ch
    onChange(arr.join('').slice(0, length))
    if (ch && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        e.preventDefault()
        const arr = digits.slice()
        arr[idx - 1] = ''
        onChange(arr.join(''))
        refs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      e.preventDefault()
      refs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, length - 1)
    refs.current[focusIdx]?.focus()
  }

  return (
    <>
      <style>{`
        .otp-row { display: flex; gap: 10px; justify-content: space-between; }
        .otp-box {
          flex: 1; min-width: 0;
          height: 54px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f0eaff;
          font-family: 'Geist', 'DM Sans', monospace;
          font-size: 22px; font-weight: 600;
          text-align: center;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          caret-color: #a78bfa;
        }
        .otp-box:focus {
          border-color: rgba(167,139,250,0.55);
          background: rgba(167,139,250,0.05);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.12);
        }
        .otp-box:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-box.error {
          border-color: rgba(239,68,68,0.45);
          background: rgba(239,68,68,0.05);
        }
        .otp-box.error:focus { box-shadow: 0 0 0 4px rgba(239,68,68,0.12); }
        @media (max-width: 380px) {
          .otp-row { gap: 6px; }
          .otp-box { height: 48px; font-size: 19px; }
        }
      `}</style>
      <div className="otp-row" role="group" aria-label="One-time verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            value={d}
            onChange={e => setDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            className={`otp-box${error ? ' error' : ''}`}
          />
        ))}
      </div>
    </>
  )
}
