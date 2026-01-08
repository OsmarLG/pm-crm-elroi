"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, File as FileIcon, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Props = {
  folderId: number | null
  onUploadSuccess: () => void
}

type QueueItem = {
  id: string
  file: File
  title: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  previewUrl?: string
}

export function FileUploader({ folderId, onUploadSuccess }: Props) {
  const [queue, setQueue] = React.useState<QueueItem[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)

  // Handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newItems: QueueItem[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      title: "",
      status: "pending",
      progress: 0,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }))

    setQueue((prev) => [...prev, ...newItems])
  }

  // Handle paste
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files?.length) {
        handleFiles(e.clipboardData.files)
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  // Upload logic
  const uploadItem = async (item: QueueItem) => {
    if (item.status === "success" || item.status === "uploading") return

    setQueue((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i))
    )

    const fd = new FormData()
    fd.append("file", item.file)
    if (item.title.trim()) fd.append("title", item.title.trim())
    if (folderId !== null) fd.append("folder_id", String(folderId))

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/files")

      // Get XSRF token from cookie (Laravel/Inertia standard)
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
      }

      const xsrfToken = getCookie('XSRF-TOKEN')
      if (xsrfToken) {
        xhr.setRequestHeader('X-XSRF-TOKEN', decodeURIComponent(xsrfToken))
      }

      // Also X-Requested-With for Laravel to treat it as AJAX
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total)
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          )
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "success", progress: 100 } : i))
          )
          resolve()
        } else {
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
          )
          toast.error(`Failed to upload ${item.file.name}`)
          reject()
        }
      }

      xhr.onerror = () => {
        setQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
        )
        toast.error(`Network error uploading ${item.file.name}`)
        reject()
      }

      xhr.send(fd)
    })
  }

  const uploadAll = async () => {
    const pending = queue.filter((i) => i.status === "pending" || i.status === "error")
    if (pending.length === 0) return

    for (const item of pending) {
      try {
        await uploadItem(item)
      } catch (err) {
        // Continue with next one even if one fails
      }
    }

    // Auto-clear successful uploads after a short delay
    setTimeout(() => {
      setQueue((prev) => prev.filter((i) => i.status !== "success"))
    }, 1500)

    onUploadSuccess()
  }

  const remove = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id))
  }

  const pendingCount = queue.filter((i) => i.status === "pending" || i.status === "error").length

  return (
    <div
      className={cn(
        "rounded-md border p-4 space-y-4 transition-colors",
        isDragOver ? "border-primary bg-primary/5" : "bg-card"
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Upload Files</h3>
        <div className="text-xs text-muted-foreground">
          {queue.length} file(s) ({pendingCount} pending)
        </div>
      </div>

      {/* Drop Zone / Input */}
      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-accent/50 transition">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          Drag & drop,{" "}
          <label className="text-primary hover:underline cursor-pointer">
            browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          , or paste (Ctrl+V) images.
        </div>
      </div>

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border p-2 text-sm"
            >
              {/* Preview */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="truncate font-medium flex items-center gap-2">
                  {item.file.name}
                  {item.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                  {item.status === "error" && <AlertCircle className="h-3 w-3 text-destructive" />}
                </div>

                {item.status === "pending" && (
                  <Input
                    className="h-6 text-xs px-2"
                    placeholder="Optional title"
                    value={item.title}
                    onChange={e => setQueue(q => q.map(i => i.id === item.id ? { ...i, title: e.target.value } : i))}
                  />
                )}

                {/* Progress Bar */}
                {item.status === "uploading" && (
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(item.id)}
                disabled={item.status === "uploading"}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {queue.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setQueue([])}>
            Clear All
          </Button>
          <Button size="sm" onClick={uploadAll} disabled={pendingCount === 0}>
            {pendingCount === 0 ? "All Done" : `Upload ${pendingCount} Files`}
          </Button>
        </div>
      )}
    </div>
  )
}
