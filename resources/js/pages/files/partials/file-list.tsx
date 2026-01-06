"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FileItem } from "../types"

type Props = {
  files: FileItem[]
  activeFileId: number | null
  onSelect: (id: number) => void
  onPreview: (id: number) => void
  onDownload: (id: number) => void
  onDelete: (id: number) => void
  onBulkDelete: (ids: number[]) => void
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const v = bytes / Math.pow(k, i)
  return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

function canPreview(mime: string | null): boolean {
  const m = mime ?? ""
  return (
    m.startsWith("image/") ||
    m.startsWith("audio/") ||
    m.startsWith("video/") ||
    m === "application/pdf"
  )
}

function previewLabel(mime: string | null): string {
  const m = mime ?? ""
  if (m.startsWith("audio/") || m.startsWith("video/")) return "Play"
  if (m.startsWith("image/") || m === "application/pdf") return "View"
  return "View"
}

export function FileList({
  files,
  activeFileId,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  onBulkDelete,
}: Props) {
  const [selected, setSelected] = React.useState<Record<number, boolean>>({})

  const selectedIds = React.useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)),
    [selected]
  )

  const toggle = (id: number) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  const clear = () => setSelected({})

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Files</div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => {
            onBulkDelete(selectedIds)
            clear()
          }}
        >
          Delete selected
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="text-sm text-muted-foreground">No files.</div>
      ) : (
        <div className="space-y-1">
          {files.map((f) => {
            const isActive = activeFileId === f.id
            const previewable = canPreview(f.mime_type)

            return (
              <div
                key={f.id}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition",
                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                )}
              >
                <input type="checkbox" checked={!!selected[f.id]} onChange={() => toggle(f.id)} />

                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect(f.id)}>
                  <div className="truncate font-medium">{f.title}</div>
                  <div className="truncate text-xs opacity-80">
                    {f.original_name} • {formatBytes(f.size)} • {f.mime_type ?? "unknown"}
                  </div>
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(f.id)}
                  disabled={!previewable}
                  title={previewable ? "Preview fullscreen" : "No preview available"}
                >
                  {previewLabel(f.mime_type)}
                </Button>

                <Button type="button" variant="ghost" size="sm" onClick={() => onDownload(f.id)}>
                  Download
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onDelete(f.id)}
                >
                  Delete
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
