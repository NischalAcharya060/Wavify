'use client'

import { useState, useEffect, useCallback } from 'react'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0 })

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const menuWidth = 200
    const menuHeight = 240

    const x = e.clientX + menuWidth > window.innerWidth
        ? e.clientX - menuWidth
        : e.clientX

    const y = e.clientY + menuHeight > window.innerHeight
        ? e.clientY - menuHeight
        : e.clientY

    setMenu({ visible: true, x, y })
  }, [])

  const close = useCallback(() => {
    setMenu(prev => prev.visible ? { ...prev, visible: false } : prev)
  }, [])

  useEffect(() => {
    if (!menu.visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('contextmenu', close)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menu.visible, close])

  return { menu, open, close }
}