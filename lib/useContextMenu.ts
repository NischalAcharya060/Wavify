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
    const x = Math.min(e.clientX, window.innerWidth - 200)
    const y = Math.min(e.clientY, window.innerHeight - 240)
    setMenu({ visible: true, x, y })
  }, [])

  const close = useCallback(() => setMenu(m => ({ ...m, visible: false })), [])

  useEffect(() => {
    if (!menu.visible) return
    const h = () => close()
    window.addEventListener('click', h)
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
    return () => window.removeEventListener('click', h)
  }, [menu.visible, close])

  return { menu, open, close }
}
