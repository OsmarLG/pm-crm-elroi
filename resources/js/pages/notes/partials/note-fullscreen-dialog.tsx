"use client"

import * as React from "react"
import MDEditor from "@uiw/react-md-editor"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// estilos
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

type Props = {
    children: React.ReactNode

    title: string
    content: string
    mode: "view" | "edit"
    isDark?: boolean

    // solo cuando mode="edit"
    onChange?: (next: string) => void
}

export function NoteFullscreenDialog({
    children,
    title,
    content,
    mode,
    isDark = false,
    onChange,
}: Props) {
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent
                className={[
                    // ✅ fullscreen real
                    "w-[100vw] max-w-none h-[100vh] max-h-none",
                    "p-0 gap-0",
                    "border-0 rounded-none",
                    "bg-background text-foreground",
                ].join(" ")}
            >
                <div className="h-full flex flex-col">
                    <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between">
                        <DialogTitle className="truncate">{title || "(Untitled)"}</DialogTitle>

                        
                    </DialogHeader>

                    <div className="flex-1 p-4 overflow-auto">
                        {mode === "edit" ? (
                            <div data-color-mode={isDark ? "dark" : "light"} className="rounded-md border overflow-hidden bg-background">
                                <MDEditor
                                    value={content}
                                    onChange={(v) => onChange?.(v ?? "")}
                                    preview="edit"           // ✅ solo editor (sin preview derecha)
                                    hideToolbar              // ✅ sin toolbar
                                    visibleDragbar={false}   // ✅ sin barra
                                    commands={[]}            // ✅ sin comandos
                                    extraCommands={[]}       // ✅ sin extra comandos
                                    height={window.innerHeight - 120}
                                />
                            </div>
                        ) : (
                            <div data-color-mode={isDark ? "dark" : "light"} className="rounded-md border p-4">
                                <MDEditor.Markdown source={content || ""} />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
