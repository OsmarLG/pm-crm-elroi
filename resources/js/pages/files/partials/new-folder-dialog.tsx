"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
  parentId: number | null
  onCreate: (name: string, parentId: number | null) => void
}

export function NewFolderDialog({ open, setOpen, parentId, onCreate }: Props) {
  const [name, setName] = React.useState("")

  React.useEffect(() => {
    if (open) setName("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Parent: {parentId ?? "root"}</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim()) return
              onCreate(name.trim(), parentId)
              setOpen(false)
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
