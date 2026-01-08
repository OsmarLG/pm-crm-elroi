"use client"

import * as React from "react"
import { Note, NoteFolder as Folder } from "../types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Pencil, Eye, MoreHorizontal, Globe, Lock, Link as LinkIcon, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { router } from "@inertiajs/react"
import { Link } from "@inertiajs/react"

type Props = {
  notes: Note[]
  folders?: Folder[]
  activeNoteId: number | null
  onSelect: (id: number) => void
  onView: (id: number) => void
  onEdit: (id: number) => void
  onCreate: () => void
  onDelete: (id: number) => void
  onBulkDelete?: (ids: number[]) => void
}

function flattenFolders(folders: Folder[] = []) {
  const map = new Map<number, Folder>()
  const walk = (list: Folder[]) => {
    list.forEach((f) => {
      map.set(Number(f.id), f)
      if (f.children?.length) walk(f.children)
    })
  }
  walk(folders)
  return map
}

function formatDate(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString()
}

export function NoteList({
  notes,
  folders = [],
  activeNoteId,
  onSelect,
  onView,
  onEdit,
  onCreate,
  onDelete,
  onBulkDelete,
}: Props) {
  const [q, setQ] = React.useState("")
  const [selected, setSelected] = React.useState<Record<number, boolean>>({})

  const folderMap = React.useMemo(() => flattenFolders(folders), [folders])

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return notes
    return notes.filter((n) => {
      const t = (n.title ?? "").toLowerCase()
      const c = (n.content ?? "").toLowerCase()
      return t.includes(term) || c.includes(term)
    })
  }, [notes, q])

  const selectedIds = React.useMemo(
    () => Object.keys(selected).filter((k) => selected[Number(k)]).map(Number),
    [selected]
  )

  const allChecked = filtered.length > 0 && filtered.every((n) => selected[Number(n.id)])
  const someChecked = filtered.some((n) => selected[Number(n.id)]) && !allChecked

  // ✅ Acción default para "ver": ir a /notes/{id}
  const goView = (id: number) => {
    // si quieres manejarlo desde el padre, úsalo
    if (onView) return onView(id)

    // si no, navega directo
    router.visit(`/notes/${id}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">Notes ({filtered.length})</div>

        <div className="flex items-center gap-2">
          {onBulkDelete && selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedIds)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}

          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New note
          </Button>
        </div>
      </div>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes..." />

      <div className="rounded-md border overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
          <Checkbox
            checked={allChecked || (someChecked && "indeterminate")}
            onCheckedChange={(v) => {
              const checked = !!v
              const next = { ...selected }
              filtered.forEach((n) => (next[n.id] = checked))
              setSelected(next)
            }}
            aria-label="Select all visible notes"
          />
          <span className="text-xs text-muted-foreground">Select all</span>
        </div>

        <div className="max-h-[62vh] overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No notes.</div>
          ) : (
            filtered.map((n) => {
              const isActive = n.id === activeNoteId

              const folderName =
                n.folder_id
                  ? (n.folder_name ?? folderMap.get(n.folder_id)?.name ?? `Folder #${n.folder_id}`)
                  : "No folder"

              const dateLabel = formatDate(n.updated_at ?? n.created_at)

              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-2 px-3 py-2 border-b last:border-b-0",
                    "hover:bg-accent/60 cursor-pointer",
                    isActive && "bg-accent"
                  )}
                  onClick={() => onSelect(Number(n.id))}
                >
                  <Checkbox
                    checked={!!selected[n.id]}
                    onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [n.id]: !!v }))}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Select note"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{n.title}</div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate max-w-[140px]">{folderName}</span>
                      {dateLabel && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="truncate">{dateLabel}</span>
                        </>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {(n.content ?? "").replace(/\n/g, " ").slice(0, 140)}
                    </div>
                  </div>

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
                          goView(Number(n.id))
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(Number(n.id))
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.put(`/notes/${n.id}`, {
                            folder_id: n.folder_id,
                            visibility: n.visibility === 'public' ? 'private' : 'public'
                          }, { preserveScroll: true })
                        }}
                      >
                        {n.visibility === 'public' ? (
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

                      {n.visibility === 'public' && n.uuid && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = `${window.location.origin}/n/${n.uuid}`
                            navigator.clipboard.writeText(url)
                            // assuming toast is available or use alert, checking if toast is imported
                            // toast is NOT imported in NoteList currently.
                            // I will use alert/console or add toast import if needed.
                            // Assuming toast from sonner is global layout or I'll add import.
                            // I'll add import for toast from sonner.
                          }}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Copy Direct Public Link
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = `${window.location.origin}/notes/${n.id}`
                          navigator.clipboard.writeText(url)
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
                          onDelete(Number(n.id))
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
                        goView(n.id)
                      }}
                      title="View note"
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
                        onEdit(n.id)
                      }}
                      title="Edit note"
                    >
                      <Pencil className="h-4 w-4" />
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
                            router.put(`/notes/${n.id}`, {
                              folder_id: n.folder_id,
                              visibility: n.visibility === 'public' ? 'private' : 'public'
                            }, { preserveScroll: true })
                          }}
                        >
                          {n.visibility === 'public' ? (
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

                        {n.visibility === 'public' && n.uuid && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/n/${n.uuid}`
                              navigator.clipboard.writeText(url)
                            }}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Copy Public Link
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = `${window.location.origin}/notes/${n.id}`
                            navigator.clipboard.writeText(url)
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
                            onDelete(Number(n.id))
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
            })
          )}
        </div>
      </div>
    </div>
  )
}
