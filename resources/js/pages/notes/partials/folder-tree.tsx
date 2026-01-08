"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Folder as FolderIcon,
  FolderOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Pencil,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NoteFolder as Folder } from "../types"

type Props = {
  folders: Folder[] // roots con children
  activeFolderId: number | null
  onSelect: (folderId: number | null) => void
  onNewFolder: (parentId: number | null) => void
  onRenameFolder: (id: number, name: string) => void
  onDeleteFolder: (id: number, name: string) => void
  noFolderId?: number // default 0
}

function getChildren(node: Folder): Folder[] {
  return Array.isArray(node.children) ? node.children : []
}

function findPathTo(
  nodes: Folder[],
  targetId: number
): number[] | null {
  for (const n of nodes) {
    const id = Number(n.id)
    if (id === targetId) return [id]
    const children = getChildren(n)
    if (children.length) {
      const childPath = findPathTo(children, targetId)
      if (childPath) return [id, ...childPath]
    }
  }
  return null
}

export function FolderTree({
  folders,
  activeFolderId,
  onSelect,
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
  noFolderId = 0,
}: Props) {
  // open state por folderId
  const [open, setOpen] = React.useState<Record<number, boolean>>({})

  const toggle = (id: number) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  // ✅ al cargar / cambiar carpeta activa: abrir solo la ruta hasta ella
  React.useEffect(() => {
    if (!activeFolderId || activeFolderId === noFolderId) return
    const path = findPathTo(folders, activeFolderId)
    if (!path) return
    setOpen((prev) => {
      const next = { ...prev }
      for (const id of path) next[id] = true
      return next
    })
  }, [activeFolderId, folders, noFolderId])

  const FolderRow = ({ node, depth }: { node: Folder; depth: number }) => {
    const id = Number(node.id)
    const isActive = activeFolderId === id
    const children = getChildren(node)
    const hasChildren = children.length > 0
    const isOpen = open[id] ?? false // ✅ por defecto colapsado

    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
          )}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {/* expand/collapse */}
          <button
            type="button"
            className={cn(
              "h-6 w-6 grid place-items-center rounded hover:bg-accent/70",
              !hasChildren && "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
              e.stopPropagation()
              toggle(id)
            }}
            aria-label={isOpen ? "Collapse" : "Expand"}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="h-4 w-4 opacity-80" />
              ) : (
                <ChevronRight className="h-4 w-4 opacity-80" />
              )
            ) : null}
          </button>

          {/* label */}
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            onClick={() => onSelect(id)}
          >
            {isActive ? (
              <FolderOpen className="h-4 w-4 shrink-0 opacity-90" />
            ) : (
              <FolderIcon className="h-4 w-4 shrink-0 opacity-80" />
            )}
            <span className="truncate">{node.name}</span>
          </button>

          {/* actions */}
          {/* actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onNewFolder(id)
                    setOpen((p) => ({ ...p, [id]: true }))
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New subfolder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onRenameFolder(id, node.name)
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteFolder(id, node.name)
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
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onNewFolder(id)
                  setOpen((p) => ({ ...p, [id]: true }))
                }}
                aria-label="New subfolder"
                title="New subfolder"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onRenameFolder(id, node.name)
                }}
                aria-label="Rename folder"
                title="Rename folder"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteFolder(id, node.name)
                }}
                aria-label="Delete folder"
                title="Delete folder"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {children.map((c) => (
              <FolderRow key={Number(c.id)} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const NoFolderRow = () => {
    const isActive = activeFolderId === noFolderId
    return (
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
        )}
      >
        <div className="h-6 w-6" />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onSelect(noFolderId)}
        >
          {isActive ? (
            <FolderOpen className="h-4 w-4 shrink-0 opacity-90" />
          ) : (
            <FolderIcon className="h-4 w-4 shrink-0 opacity-80" />
          )}
          <span className="truncate">No folder</span>
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-md border p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Folders</div>
        <Button type="button" variant="outline" size="sm" onClick={() => onNewFolder(null)}>
          New folder
        </Button>
      </div>

      {/* All notes */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "mb-2 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
          activeFolderId == null ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
        )}
      >
        <FolderIcon className="h-4 w-4 opacity-80" />
        <span className="truncate">All notes (including no folder)</span>
      </button>

      <div className="space-y-1">
        <NoFolderRow />

        {folders.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">No folders yet.</div>
        ) : (
          folders.map((node) => <FolderRow key={Number(node.id)} node={node} depth={0} />)
        )}
      </div>
    </div>
  )
}
