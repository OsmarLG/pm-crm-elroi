"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react"
import type { FileFolder } from "../types"

type Props = {
  folders: FileFolder[]
  value: number | null // folder_id
  onChange: (folderId: number | null) => void
  noFolderLabel?: string
}

function getChildren(node: FileFolder): FileFolder[] {
  return Array.isArray(node.children) ? node.children : []
}

export function FolderTreeSelect({
  folders,
  value,
  onChange,
  noFolderLabel = "No folder",
}: Props) {
  const [open, setOpen] = React.useState<Record<number, boolean>>({})

  const toggle = (id: number) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  const Row = ({ node, depth }: { node: FileFolder; depth: number }) => {
    const id = Number(node.id)
    const children = getChildren(node)
    const hasChildren = children.length > 0
    const isOpen = open[id] ?? false
    const isActive = value === id

    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
          )}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          <button
            type="button"
            className={cn(
              "h-6 w-6 grid place-items-center rounded hover:bg-accent/70",
              !hasChildren && "opacity-0 pointer-events-none"
            )}
            onClick={() => toggle(id)}
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

          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 flex-1 justify-start gap-2"
            onClick={() => onChange(id)}
          >
            {isActive ? (
              <FolderOpen className="h-4 w-4 opacity-90" />
            ) : (
              <Folder className="h-4 w-4 opacity-80" />
            )}
            <span className="truncate">{node.name}</span>
          </Button>
        </div>

        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {children.map((c) => (
              <Row key={Number(c.id)} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border p-2 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={value === null ? "secondary" : "outline"}
          size="sm"
          onClick={() => onChange(null)}
        >
          {noFolderLabel}
        </Button>
      </div>

      <div className="space-y-1 max-h-[320px] overflow-auto pr-1">
        {folders.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">No folders yet.</div>
        ) : (
          folders.map((node) => <Row key={Number(node.id)} node={node} depth={0} />)
        )}
      </div>
    </div>
  )
}
