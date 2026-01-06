"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

type Props = {
  url: string // /files/{id}/text
  title?: string
}

export function TextViewer({ url, title }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [content, setContent] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetch(url, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const j = await r.json()
        if (!alive) return
        setContent(j.content ?? "")
      })
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [url])

  const copy = async () => {
    await navigator.clipboard.writeText(content)
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading preview…</div>
  if (error) return <div className="text-sm text-destructive">Preview error: {error}</div>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{title ?? "Text preview"}</div>
        <Button size="sm" variant="outline" onClick={copy}>Copy</Button>
      </div>

      <pre className="rounded-md border bg-black/20 p-3 text-xs overflow-auto max-h-[72vh]">
        {content}
      </pre>
    </div>
  )
}
