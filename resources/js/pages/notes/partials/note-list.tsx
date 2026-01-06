"use client"

import * as React from "react"
import { Note, Folder } from "../types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Pencil, Eye } from "lucide-react"
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
      map.set(f.id, f)
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

  const allChecked = filtered.length > 0 && filtered.every((n) => selected[n.id])
  const someChecked = filtered.some((n) => selected[n.id]) && !allChecked

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
                  onClick={() => onSelect(n.id)}
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

                  <div className="flex items-center gap-1">
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

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(n.id)
                      }}
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
