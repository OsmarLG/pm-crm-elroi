"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, VolumeX, RotateCcw, RotateCw, Maximize } from "lucide-react"

type Props = {
  src: string
  mime?: string | null
}

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function VideoPlayer({ src, mime }: Props) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [ready, setReady] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [current, setCurrent] = React.useState(0)

  const [volume, setVolume] = React.useState(0.9)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(1)

  const [seeking, setSeeking] = React.useState(false)
  const seekingValueRef = React.useRef<number | null>(null)

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onLoaded = () => {
      setDuration(v.duration || 0)
      setReady(true)
    }
    const onTime = () => {
      if (seeking) return
      setCurrent(v.currentTime || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

    v.addEventListener("loadedmetadata", onLoaded)
    v.addEventListener("timeupdate", onTime)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("ended", onEnded)

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded)
      v.removeEventListener("timeupdate", onTime)
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("ended", onEnded)
    }
  }, [seeking, src])

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
  }, [volume])

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
  }, [muted])

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = rate
  }, [rate])

  const togglePlay = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (v.paused) await v.play()
      else v.pause()
    } catch {}
  }

  const seekTo = (value: number) => {
    const v = videoRef.current
    if (!v) return
    const t = clamp(value, 0, duration || 0)
    v.currentTime = t
    setCurrent(t)
  }

  const nudge = (delta: number) => {
    const v = videoRef.current
    if (!v) return
    seekTo((v.currentTime || 0) + delta)
  }

  const stepRate = () => {
    const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1
    setRate(next)
  }

  const fullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await el.requestFullscreen()
    } catch {}
  }

  const max = Math.max(1, duration || 1)

  return (
    <div ref={containerRef} className="rounded-md border overflow-hidden">
      <div className="bg-black/40">
        <video
          ref={videoRef}
          className="w-full max-h-[72vh]"
          preload="metadata"
          playsInline
        >
          <source src={src} type={mime ?? undefined} />
        </video>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={togglePlay} disabled={!ready}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button type="button" variant="outline" size="icon" onClick={() => nudge(-10)} disabled={!ready}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button type="button" variant="outline" size="icon" onClick={() => nudge(10)} disabled={!ready}>
            <RotateCw className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <Slider
              value={[seeking ? (seekingValueRef.current ?? current) : current]}
              min={0}
              max={max}
              step={0.1}
              disabled={!ready}
              onValueChange={(v) => {
                const val = v[0] ?? 0
                if (!seeking) setSeeking(true)
                seekingValueRef.current = val
                setCurrent(val)
              }}
              onValueCommit={(v) => {
                const val = v[0] ?? 0
                setSeeking(false)
                seekingValueRef.current = null
                seekTo(val)
              }}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={stepRate} disabled={!ready}>
            {rate}x
          </Button>

          <Button type="button" variant="outline" size="icon" onClick={fullscreen} disabled={!ready}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => setMuted((m) => !m)} disabled={!ready}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <div className="w-44">
            <Slider
              value={[muted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(v) => {
                const val = v[0] ?? 0
                setMuted(val === 0)
                setVolume(val)
              }}
              disabled={!ready}
            />
          </div>

          <div className="text-xs text-muted-foreground">{Math.round((muted ? 0 : volume) * 100)}%</div>
        </div>
      </div>
    </div>
  )
}
