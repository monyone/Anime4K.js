import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoUpscaler } from 'anime4k.js/upscaler'
import PresetSelector from './PresetSelector'
import PRESETS from '../utils/presets'

export default function VideoDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].value)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const upscalerRef = useRef<VideoUpscaler | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const cleanup = useCallback(() => {
    if (upscalerRef.current) {
      upscalerRef.current.detachVideo()
      upscalerRef.current = null
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    cleanup()
    if (videoUrl) URL.revokeObjectURL(videoUrl)

    setVideoUrl(URL.createObjectURL(file))
    setDimensions(null)
  }, [videoUrl, cleanup])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !videoUrl) return

    const setup = () => {
      cleanup()

      const preset = PRESETS.find((p) => p.value === presetKey)
      if (!preset) return

      setDimensions({ width: video.videoWidth, height: video.videoHeight })

      const upscaler = new VideoUpscaler(preset.config)
      upscaler.attachVideo(video, canvas)
      upscaler.start()
      upscalerRef.current = upscaler
    }

    if (video.readyState >= 1) {
      setup()
    } else {
      video.addEventListener('loadedmetadata', setup, { once: true })
      return () => {
        video.removeEventListener('loadedmetadata', setup)
      }
    }

    return cleanup
  }, [videoUrl, presetKey, cleanup])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!container || !video || !canvas || !dimensions) return

    const x = e.nativeEvent.offsetX
    const percent = Math.min(100, (x * 100) / dimensions.width + 1)
    video.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`
    canvas.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`
  }, [dimensions])

  const onMouseLeave = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    video.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
    canvas.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
          Choose Video
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <PresetSelector
          presets={PRESETS.map((p) => ({ label: p.label, value: p.value }))}
          value={presetKey}
          onChange={setPresetKey}

        />
        {dimensions && (
          <span className="text-sm text-gray-400">
            Left: Original / Right: Upscaled
          </span>
        )}
      </div>

      {videoUrl ? (
        <div
          ref={containerRef}
          className="relative inline-block"
          style={dimensions ? { width: dimensions.width, height: dimensions.height } : undefined}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="absolute top-0 left-0 block"
            style={{
              width: dimensions?.width,
              height: dimensions?.height,
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
            }}
          />
          <canvas
            ref={canvasRef}
            className="block pointer-events-none"
            style={{
              width: dimensions?.width,
              height: dimensions?.height,
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
            }}
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center text-gray-400">
          Select a video file to start
        </div>
      )}
    </div>
  )
}
