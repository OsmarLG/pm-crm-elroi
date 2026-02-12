"use client"

import * as React from "react"
import MDEditor, { getCommands } from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from "@/components/ui/dialog"
import { X, Save } from "lucide-react"

type Props = {
    title: string
    content: string
    mode?: "edit" | "preview"
    onSave?: (payload: { title: string; content: string }) => void
    children: React.ReactNode
}

export function NoteFullscreenDialog({
    title,
    content,
    mode = "edit",
    onSave,
    children,
}: Props) {
    const [open, setOpen] = React.useState(false)
    const [localTitle, setLocalTitle] = React.useState(title)
    const [localContent, setLocalContent] = React.useState(content)

    React.useEffect(() => setLocalTitle(title), [title])
    React.useEffect(() => setLocalContent(content), [content])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />

            <DialogContent
                className="
          fixed inset-0 z-50
          w-screen h-screen max-w-none
          p-0 border-0 rounded-none
          bg-background
          flex flex-col
        "
            >
                {/* Header */}
                <div className="h-14 shrink-0 px-4 border-b flex items-center justify-between">
                    <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                            {localTitle || "Untitled"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Markdown supported
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onSave && (
                            <Button
                                size="sm"
                                onClick={() => onSave({ title: localTitle, content: localContent })}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        )}

                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0">
                    <div className="h-full">
                        <MDEditor
                            value={localContent}
                            onChange={(v) => setLocalContent(v ?? "")}
                            preview={mode}
                            height="100%"
                            commands={[...getCommands().filter((cmd) => cmd.name !== "fullscreen")]}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
