import { useCallback, useRef, useState } from 'react'
import { ImageUpscaler } from 'anime4k.js/upscaler'
import PresetSelector from './PresetSelector'
import PRESETS from '../utils/presets'

export default function ImageDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[1].value)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [processing, setProcessing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const originalRef = useRef<HTMLImageElement>(null)
  const upscaledRef = useRef<HTMLImageElement>(null)

  const doUpscale = useCallback((img: HTMLImageElement, presetValue: string) => {
    const preset = PRESETS.find((p) => p.value === presetValue)
    if (!preset) return

    setProcessing(true)

    requestAnimationFrame(() => {
      const upscaler = new ImageUpscaler(preset.config)
      const canvas = document.createElement('canvas')
      upscaler.attachSource(img, canvas)
      upscaler.upscale()
      setUpscaledUrl(canvas.toDataURL())
      upscaler.detachSource()
      setProcessing(false)
    })
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (imageUrl) URL.revokeObjectURL(imageUrl)

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setUpscaledUrl(null)

    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height })
      doUpscale(img, presetKey)
    }
    img.src = url
  }, [imageUrl, presetKey, doUpscale])

  const handlePresetChange = useCallback((value: string) => {
    setPresetKey(value)
    if (!imageUrl) return

    setUpscaledUrl(null)
    const img = new Image()
    img.onload = () => {
      doUpscale(img, value)
    }
    img.src = imageUrl
  }, [imageUrl, doUpscale])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const original = originalRef.current
    const upscaled = upscaledRef.current
    if (!original || !upscaled || !dimensions) return

    const x = e.nativeEvent.offsetX
    const percent = (x * 100) / dimensions.width
    original.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`
    upscaled.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`
  }, [dimensions])

  const onMouseLeave = useCallback(() => {
    const original = originalRef.current
    const upscaled = upscaledRef.current
    if (!original || !upscaled) return

    original.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
    upscaled.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
          Choose Image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <PresetSelector
          presets={PRESETS.map((p) => ({ label: p.label, value: p.value }))}
          value={presetKey}
          onChange={handlePresetChange}
          disabled={processing}
        />
        {processing && (
          <span className="text-sm text-gray-400 animate-pulse">Processing...</span>
        )}
        {dimensions && !processing && (
          <span className="text-sm text-gray-400">
            Left: Original / Right: Upscaled
          </span>
        )}
      </div>

      {imageUrl && dimensions ? (
        <div
          ref={containerRef}
          className="relative inline-block"
          style={{ width: dimensions.width, height: dimensions.height }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <img
            ref={originalRef}
            src={imageUrl}
            className="absolute top-0 left-0 block"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
            }}
          />
          {upscaledUrl ? (
            <img
              ref={upscaledRef}
              src={upscaledUrl}
              className="block"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
              }}
            />
          ) : (
            <div
              className="bg-gray-800 flex items-center justify-center"
              style={{ width: dimensions.width, height: dimensions.height }}
            >
              <span className="text-gray-500 animate-pulse">Processing...</span>
            </div>
          )}
        </div>
      ) : !imageUrl ? (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center text-gray-400">
          Select an image file to start
        </div>
      ) : null}
    </div>
  )
}
