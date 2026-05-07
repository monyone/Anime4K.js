import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoUpscaler } from 'anime4k.js/upscaler'
import PresetSelector from './PresetSelector'
import ComparisonSlider from './ComparisonSlider'
import PRESETS from '../utils/presets'

export default function VideoDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].value)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const upscalerRef = useRef<VideoUpscaler | null>(null)

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
      </div>

      {videoUrl ? (
        <ComparisonSlider
          width={dimensions?.width ?? 0}
          height={dimensions?.height ?? 0}
        >
          {({ leftClip, rightClip }) => (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="absolute top-0 left-0 block"
                style={{
                  width: dimensions?.width,
                  height: dimensions?.height,
                  clipPath: dimensions ? leftClip : undefined,
                }}
              />
              <canvas
                ref={canvasRef}
                className="block pointer-events-none"
                style={{
                  width: dimensions?.width,
                  height: dimensions?.height,
                  clipPath: dimensions ? rightClip : undefined,
                }}
              />
            </>
          )}
        </ComparisonSlider>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center text-gray-400">
          Select a video file to start
        </div>
      )}
    </div>
  )
}
