"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { FileItem } from "../types"
import { AudioPlayer } from "./audio-player"
import { VideoPlayer } from "./video-player"
import { TextViewer } from "./text-viewer"
import { MoreVertical, Copy, Globe, Lock, Download, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type Props = {
  file: FileItem
  src: string
  onDownload: () => void
  onEdit?: () => void
  mode?: "panel" | "modal"
}

/* ======================================================
   Image zoom (images)
====================================================== */
function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = React.useState(1)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const [drag, setDrag] = React.useState<{
    sx: number
    sy: number
    bx: number
    by: number
  } | null>(null)

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((s) => clamp(Number((s + delta).toFixed(2)), 1, 4))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Scroll to zoom • Drag to pan
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setScale(1)
            setPos({ x: 0, y: 0 })
          }}
        >
          Reset
        </Button>
      </div>

      <div
        className="rounded-md border overflow-hidden bg-black/20 cursor-grab"
        onWheel={onWheel}
        onMouseDown={(e) =>
          setDrag({ sx: e.clientX, sy: e.clientY, bx: pos.x, by: pos.y })
        }
        onMouseMove={(e) => {
          if (!drag) return
          setPos({
            x: drag.bx + (e.clientX - drag.sx),
            y: drag.by + (e.clientY - drag.sy),
          })
        }}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-none select-none"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          }}
        />
      </div>
    </div>
  )
}

/* ======================================================
   File Viewer
====================================================== */
export function FileViewer({
  file,
  src,
  onDownload,
  onEdit,
  mode = "panel",
}: Props) {
  const mime = file.mime_type ?? ""
  const ext = (file.original_name?.split(".").pop() ?? "").toLowerCase()

  const isImage = mime.startsWith("image/")
  const isPdf = mime === "application/pdf"
  const isAudio = mime.startsWith("audio/")
  const isVideo = mime.startsWith("video/")
  const isText =
    mime.startsWith("text/") ||
    ["csv", "json", "xml", "txt", "log", "md"].includes(ext) ||
    mime === "application/json" ||
    mime === "application/xml"

  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)
  const isExe = ext === "exe"

  /* ======================================================
     Copy URL (absolute)
  ====================================================== */
  const [copied, setCopied] = React.useState(false)

  const absoluteUrl = React.useMemo(() => {
    if (typeof window === "undefined") return src
    return new URL(src, window.location.origin).toString()
  }, [src])

  const onCopyUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl)
      } else {
        const el = document.createElement("textarea")
        el.value = absoluteUrl
        el.setAttribute("readonly", "true")
        el.style.position = "absolute"
        el.style.left = "-9999px"
        document.body.appendChild(el)
        el.select()
        document.execCommand("copy")
        document.body.removeChild(el)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // fallback: abrir el archivo
      window.open(absoluteUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-3">
      {mode === "panel" && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Title</div>
            <div className="truncate text-base font-semibold">
              {file.title}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {file.original_name}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => {
                  import('@inertiajs/react').then(({ router }) => {
                    router.put(`/files/${file.id}`, {
                      title: file.title,
                      folder_id: file.folder_id,
                      visibility: file.visibility === 'public' ? 'private' : 'public'
                    }, { preserveScroll: true })
                  })
                }}>
                  {file.visibility === 'public' ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Make Public
                    </>
                  )}
                </DropdownMenuItem>

                {file.visibility === 'public' && file.uuid && (
                  <DropdownMenuItem onClick={() => {
                    const url = `${window.location.origin}/f/${file.uuid}`
                    navigator.clipboard.writeText(url)
                    toast.success('Public link copied!')
                  }}>
                    <Globe className="h-4 w-4 mr-2" />
                    Copy Public Link
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onCopyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Internal URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {isImage && <ImageZoom src={src} alt={file.title} />}

      {isPdf && (
        <iframe
          src={src}
          className={
            mode === "modal"
              ? "w-full h-[72vh]"
              : "w-full h-[520px]"
          }
        />
      )}

      {isAudio && <AudioPlayer src={src} mime={mime} />}

      {isVideo && <VideoPlayer src={src} mime={mime} />}

      {isText && (
        <TextViewer
          url={`/files/${file.id}/text`}
          title={`${ext.toUpperCase()} preview`}
        />
      )}

      {isOffice && (
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Office document</div>
          <div className="text-sm text-muted-foreground">
            Preview requires conversion to PDF or external viewer.
          </div>
          <Button onClick={onDownload}>Download</Button>
        </div>
      )}

      {isExe && (
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Executable file</div>
          <div className="text-sm text-muted-foreground">
            Executables cannot be previewed for security reasons.
          </div>
          <Button onClick={onDownload}>Download</Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Type: {mime || "unknown"} • Size: {file.size}
      </div>
    </div>
  )
}
