"use client"

import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, X } from "lucide-react"
import { NoteFullscreenDialog } from "./note-fullscreen-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Note, NoteFolder as Folder } from "../types"

type Props = {
  note: Note | null
  folderId: number | null
  folders: Folder[]
  onSave: (payload: {
    title: string
    content: string
    folder_id: number | null
  }) => void
  onCancel: () => void
  saving?: boolean
}

type FolderOption = { id: number | null; label: string }

function flattenFolders(
  folders: Folder[],
  depth = 0,
  acc: FolderOption[] = []
) {
  for (const f of folders) {
    const id = Number(f.id)
    const indent = "\u00A0".repeat(depth * 3)
    acc.push({ id, label: `${indent}${f.name}` })

    const children = Array.isArray(f.children) ? f.children : []
    if (children.length) flattenFolders(children, depth + 1, acc)
  }
  return acc
}

export function NoteEditor({
  note,
  folderId,
  folders,
  onSave,
  onCancel,
  saving,
}: Props) {
  const [title, setTitle] = React.useState(note?.title ?? "")
  const [content, setContent] = React.useState(note?.content ?? "")
  const [selectedFolderId, setSelectedFolderId] = React.useState<number | null>(
    note?.folder_id ?? folderId ?? null
  )

  /** 🔥 Detecta light / dark desde <html class="dark"> */
  const [colorMode, setColorMode] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const html = document.documentElement

    const syncTheme = () => {
      setColorMode(html.classList.contains("dark") ? "dark" : "light")
    }

    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(html, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    setTitle(note?.title ?? "")
    setContent(note?.content ?? "")
    setSelectedFolderId(note?.folder_id ?? folderId ?? null)
  }, [note?.id, folderId])

  const options = React.useMemo(() => {
    const flat = flattenFolders(folders)
    return [{ id: null, label: "No folder" }, ...flat]
  }, [folders])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {note ? `Edit note #${note.id}` : "New note"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Markdown supported.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NoteFullscreenDialog
            title={title || "Untitled"}
            content={content}
            mode="edit"
          >
            <Button variant="outline" size="sm">
              <span className="hidden sm:inline">Fullscreen</span>
              <span className="sm:hidden text-lg">⛶</span>
            </Button>
          </NoteFullscreenDialog>

          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>

          <Button
            size="sm"
            onClick={() =>
              onSave({
                title,
                content,
                folder_id: selectedFolderId,
              })
            }
            disabled={saving || title.trim().length === 0}
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* Folder select */}
      <div className="space-y-2">
        <Label>Folder</Label>
        <Select
          value={selectedFolderId === null ? "null" : String(selectedFolderId)}
          onValueChange={(v) =>
            setSelectedFolderId(v === "null" ? null : Number(v))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>

          <SelectContent>
            {options.map((opt) => (
              <SelectItem
                key={String(opt.id)}
                value={opt.id === null ? "null" : String(opt.id)}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My note..."
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content</Label>

        {/* ✅ EL FIX REAL */}
        <div
          data-color-mode={colorMode}
          className="rounded-md border overflow-hidden"
        >
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? "")}
            height={520}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: Usa #, ##, listas, **negritas**, etc.
        </p>
      </div>
    </div>
  )
}
