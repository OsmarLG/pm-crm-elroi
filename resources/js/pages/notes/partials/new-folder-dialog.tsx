"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

type Props = {
  onCreate: (name: string, parentId: number | null) => void
  parentId: number | null
  open: boolean
  setOpen: (v: boolean) => void
}

export function NewFolderDialog({ onCreate, parentId, open, setOpen }: Props) {
  const [name, setName] = React.useState("")

  React.useEffect(() => {
    if (!open) setName("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentId ? "New subfolder" : "New folder"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="folder_name">Name</Label>
          <Input
            id="folder_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work, Church, Ideas..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) return
              onCreate(name.trim(), parentId)
              setOpen(false)
            }}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
