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
    DialogFooter,
} from "@/components/ui/dialog"

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    folderId: number | null
    initialName: string
    onRename: (id: number, newName: string) => void
}

export function RenameFolderDialog({ open, onOpenChange, folderId, initialName, onRename }: Props) {
    const [name, setName] = React.useState(initialName)

    React.useEffect(() => {
        if (open) setName(initialName)
    }, [open, initialName])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Folder</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="folder_rename">Name</Label>
                    <Input
                        id="folder_rename"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Folder name"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!name.trim() || !folderId) return
                            onRename(folderId, name.trim())
                            onOpenChange(false)
                        }}
                        disabled={!name.trim()}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
