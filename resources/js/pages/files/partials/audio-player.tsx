"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react"

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

export function AudioPlayer({ src, mime }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const [ready, setReady] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [current, setCurrent] = React.useState(0)

  const [volume, setVolume] = React.useState(0.9)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(1)

  // cuando el usuario está arrastrando el slider, no queremos que timeupdate “salte”
  const [seeking, setSeeking] = React.useState(false)
  const seekingValueRef = React.useRef<number | null>(null)

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  React.useEffect(() => {
    const a = audioRef.current
    if (!a) return

    const onLoaded = () => {
      setDuration(a.duration || 0)
      setReady(true)
    }
    const onTime = () => {
      if (seeking) return
      setCurrent(a.currentTime || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

    a.addEventListener("loadedmetadata", onLoaded)
    a.addEventListener("timeupdate", onTime)
    a.addEventListener("play", onPlay)
    a.addEventListener("pause", onPause)
    a.addEventListener("ended", onEnded)

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded)
      a.removeEventListener("timeupdate", onTime)
      a.removeEventListener("play", onPlay)
      a.removeEventListener("pause", onPause)
      a.removeEventListener("ended", onEnded)
    }
  }, [seeking, src])

  React.useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = volume
  }, [volume])

  React.useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.muted = muted
  }, [muted])

  React.useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.playbackRate = rate
  }, [rate])

  const togglePlay = async () => {
    const a = audioRef.current
    if (!a) return
    try {
      if (a.paused) await a.play()
      else a.pause()
    } catch {
      // autoplay restrictions
    }
  }

  const seekTo = (value: number) => {
    const a = audioRef.current
    if (!a) return
    const t = clamp(value, 0, duration || 0)
    a.currentTime = t
    setCurrent(t)
  }

  const nudge = (delta: number) => {
    const a = audioRef.current
    if (!a) return
    seekTo((a.currentTime || 0) + delta)
  }

  const stepRate = () => {
    const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1
    setRate(next)
  }

  // keyboard support
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ready) return
      if (e.code === "Space") {
        e.preventDefault()
        togglePlay()
      }
      if (e.code === "ArrowRight") {
        e.preventDefault()
        nudge(5)
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault()
        nudge(-5)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [ready, duration])

  const max = Math.max(1, duration || 1)

  return (
    <div className="rounded-md border p-3 space-y-3">
      <audio ref={audioRef} preload="metadata">
        <source src={src} type={mime ?? undefined} />
      </audio>

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
              // durante drag, solo actualiza UI
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
  )
}
