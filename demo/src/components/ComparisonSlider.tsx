import { useCallback, useRef, useState } from 'react'

type Props = {
  width: number
  height: number
  children: (refs: { leftClip: string; rightClip: string }) => React.ReactNode
}

export default function ComparisonSlider({ width, height, children }: Props) {
  const [position, setPosition] = useState(50)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percent)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }, [updatePosition])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    updatePosition(e.clientX)
  }, [updatePosition])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const leftClip = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`
  const rightClip = `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)`

  return (
    <div
      ref={containerRef}
      className="relative inline-block select-none touch-none"
      style={{ width, height }}
    >
      {children({ leftClip, rightClip })}

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg cursor-ew-resize flex items-center justify-center"
        style={{ left: `${position}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 8L1 5M4 8L1 11M4 8H1M12 8L15 5M12 8L15 11M12 8H15" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
        Original
      </div>
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
        Upscaled
      </div>
    </div>
  )
}
