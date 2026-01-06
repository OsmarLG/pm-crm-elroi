"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FileFolder, FileItem } from "../types"
import { FolderTreeSelect } from "./folder-tree-select"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: FileItem | null
  folders: FileFolder[]
  onSave: (payload: { title: string; folder_id: number | null }) => void
  saving?: boolean
}

export function FileEditDialog({
  open,
  onOpenChange,
  file,
  folders,
  onSave,
  saving = false,
}: Props) {
  const [title, setTitle] = React.useState("")
  const [folderId, setFolderId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!open || !file) return
    setTitle(file.title ?? "")
    setFolderId(file.folder_id ?? null)
  }, [open, file])

  const submit = () => {
    if (!file) return
    const t = title.trim() || file.original_name
    onSave({ title: t, folder_id: folderId })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit file</DialogTitle>
        </DialogHeader>

        {!file ? (
          <div className="text-sm text-muted-foreground">No file selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="File title" />
              <div className="text-xs text-muted-foreground truncate">
                Original: {file.original_name}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Folder</div>
              <FolderTreeSelect folders={folders} value={folderId} onChange={setFolderId} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!file || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
