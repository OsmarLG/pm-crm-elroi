"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Link,
  Lock,
  Globe,
  Copy,
  Pencil,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FileItem } from "../types"

type Props = {
  files: FileItem[]
  activeFileId: number | null
  onSelect: (id: number) => void
  onPreview: (id: number) => void
  onEdit: (id: number) => void
  onDownload: (id: number) => void
  onDelete: (id: number) => void
  onBulkDelete: (ids: number[]) => void
}

import { toast } from "sonner"

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
  onEdit,
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreview(f.id)
                      }}
                      disabled={!previewable}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {previewLabel(f.mime_type)}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(f.id)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        import('@inertiajs/react').then(({ router }) => {
                          router.put(`/files/${f.id}`, {
                            title: f.title,
                            folder_id: f.folder_id,
                            visibility: f.visibility === 'public' ? 'private' : 'public'
                          }, {
                            preserveScroll: true,
                            onSuccess: () => {
                              toast.success(f.visibility === 'public' ? 'File made private' : 'File made public')
                            }
                          })
                        })
                      }}
                    >
                      {f.visibility === 'public' ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>

                    {f.visibility === 'public' && f.uuid && (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = `${window.location.origin}/f/${f.uuid}`
                            navigator.clipboard.writeText(url)
                            toast.success("Public link copied!")
                          }}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Copy Public Link
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = `${window.location.origin}/f/${f.uuid}/download`
                            navigator.clipboard.writeText(url)
                            toast.success("Direct link copied!")
                          }}
                        >
                          <Link className="mr-2 h-4 w-4" />
                          Copy Direct Public Link
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // assuming route for files.show is /files/{id}
                        const url = `${window.location.origin}/files/${f.id}`
                        navigator.clipboard.writeText(url)
                        toast.success("Internal URL copied!")
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Internal URL
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownload(f.id)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(f.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden md:flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview(f.id)
                    }}
                    disabled={!previewable}
                    title={previewable ? "Preview fullscreen" : "No preview available"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(f.id)
                    }}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(f.id)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          import('@inertiajs/react').then(({ router }) => {
                            router.put(`/files/${f.id}`, {
                              title: f.title,
                              folder_id: f.folder_id,
                              visibility: f.visibility === 'public' ? 'private' : 'public'
                            }, {
                              preserveScroll: true,
                              onSuccess: () => {
                                toast.success(f.visibility === 'public' ? 'File made private' : 'File made public')
                              }
                            })
                          })
                        }}
                      >
                        {f.visibility === 'public' ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>

                      {f.visibility === 'public' && f.uuid && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/f/${f.uuid}`
                              navigator.clipboard.writeText(url)
                              toast.success("Public link copied!")
                            }}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Copy Public Link
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/f/${f.uuid}/download`
                              navigator.clipboard.writeText(url)
                              toast.success("Direct link copied!")
                            }}
                          >
                            <Link className="mr-2 h-4 w-4" />
                            Copy Direct Public Link
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = `${window.location.origin}/files/${f.id}`
                          navigator.clipboard.writeText(url)
                          toast.success("Internal URL copied!")
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Internal URL
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(f.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
